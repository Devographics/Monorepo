import { NextRequest, NextResponse } from "next/server";
import { handlerMustHaveCurrentUser } from "~/account/user/route-handlers/getters";
import { RouteHandlerOptions } from "~/app/api/typings";
import { HandlerError } from "~/lib/handler-error";
import { fetchEditionMetadata } from "@devographics/fetch";
import { localMailTransport } from "~/lib/server/mail/transports";
import { getRawResponsesCollection } from "@devographics/mongo";
import {
  Edition,
  EditionMetadata,
  Entity,
  ResponseDocument,
  SurveyMetadata,
} from "@devographics/types";
import {
  getEditionEntities,
  getEditionQuestions,
} from "~/lib/surveys/helpers/getEditionQuestions";
import { logToFile } from "@devographics/debug";

export async function POST(
  req: NextRequest,
  { params }: RouteHandlerOptions<{ responseId: string }>
) {
  try {
    await handlerMustHaveCurrentUser(req);

    // Get responseId
    // TODO: this should be a route parameter instead
    const responseId = params.responseId;
    if (!responseId) {
      throw new HandlerError({
        id: "missing_response_id",
        message: "Could not find responseId",
        status: 400,
      });
    }

    // Get body data as JSON
    let clientData: any;
    try {
      clientData = await req.json();
    } catch (err) {
      throw new HandlerError({
        id: "invalid_data",
        message: "Found invalid data when parsing response data",
        status: 400,
      });
    }

    const { email, surveyId, editionId } = clientData;

    const { data: edition } = await fetchEditionMetadata({
      surveyId,
      editionId,
      calledFrom: "sendReadingList",
    });
    const survey = edition.survey;

    // TODO: handle string _id better
    const RawResponse = await getRawResponsesCollection();
    const response = (await RawResponse.findOne({
      _id: responseId,
    })) as ResponseDocument;

    const { subject, text, html, readingList, entities } =
      await getReadingListEmail({
        response,
        edition,
      });

    const from =
      survey.domain && `${survey.name} <hello@mail.${survey.domain}>`;

    const emailObject = {
      from,
      to: email,
      subject,
      text,
      html,
      readingList,
      entities,
    };

    // console.log("---------------------------------------------");
    // console.log(text);
    // console.log("---------------------------------------------");
    // console.log(html);
    // console.log("---------------------------------------------");

    const res = await localMailTransport.sendMail(emailObject);

    return NextResponse.json({ data: { emailObject } });
  } catch (error) {
    console.log(error);
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req);
    } else {
      return NextResponse.json(
        { error: `Could not send reading list` },
        { status: 500 }
      );
    }
  }
}

const getReadingListEmail = async ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  const { readingList } = response;
  const { survey } = edition;
  const subject = `Your personalized ${survey.name} ${edition.year} reading list`;

  const props = { survey, edition };

  const entities = getEditionEntities(edition).filter((entity) =>
    readingList.includes(entity.id)
  );

  const text = `
${textHeader(props)}

${entities.map((entity) => textItem({ ...props, entity })).join("")}

${textFooter(props)}
`;

  const html = `
${htmlHeader(props)}

${entities.map((entity) => htmlItem({ ...props, entity })).join("")}

${htmlFooter(props)}
`;
  return { subject, text, html, readingList, entities };
};

// Plain text version
const textHeader = ({ survey, edition }) =>
  `Your ${survey.name} ${edition.year} Reading List`;

const textItem = ({
  survey,
  edition,
  entity,
}: {
  survey: SurveyMetadata;
  edition: Edition;
  entity: Entity;
}) => {
  const description = entity.descriptionHtml || entity.descriptionClean;

  return `
${entity.nameClean}

${description || ""}

${entity?.mdn?.summary || ""}

${[entity?.mdn?.url, entity?.github?.url, entity?.homepage?.url]
  .filter((l) => !!l)
  .map((l) => `- ${l}`)
  .join("\n")}

${entity?.resources ? entity.resources.map((l) => `- ${l.url}`).join("\n") : ""}

------------------------
`;
};
const textFooter = ({ survey, edition }) =>
  `You are receiving this email because you completed the ${survey.name} ${edition.year} survey (${edition.questionsUrl}) and asked to receive a copy of your reading list. `;

// HTML version
const htmlHeader = (props) => `<h1>${textHeader(props)}</h1>`;

const htmlItem = ({ survey, edition, entity }) => {
  const description = entity.descriptionHtml || entity.descriptionClean;

  return `
<div>
    <h2>${entity?.nameClean}</h2>

    ${description ? `<p>${description}</p>` : ""}
    ${entity?.mdn?.summary ? `<p>${entity?.mdn?.summary}</p>` : ""}
    <div>
    <ul>
    ${[entity?.mdn?.url, entity?.github?.url, entity?.homepage?.url]
      .filter((l) => !!l)
      .map((l) => `<li>${l}</li>`)
      .join("\n")}

    ${
      entity?.resources
        ? entity.resources
            .map((l) => {
              const domain = new URL(l.url).hostname.replace("www.", "");
              return `<li><a href="${l.url}">${l.title}</a> (<code>${domain}</code>)</li>`;
            })
            .join("\n")
        : ""
    }
    </ul>
  </div>
  <br/>
  `;
};

const htmlFooter = (props) => `<hr/> <p>${textFooter(props)} </p>`;
