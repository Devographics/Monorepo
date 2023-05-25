import { NextRequest, NextResponse } from "next/server";
import { tryGetCurrentUser } from "~/account/user/route-handlers/getters";
import { RouteHandlerOptions } from "~/app/api/typings";
import { ServerError } from "~/lib/server-error";
import { fetchEditionMetadataSurveyForm } from "@devographics/fetch";
import { localMailTransport } from "~/lib/server/mail/transports";
import { getRawResponsesCollection } from "@devographics/mongo";
import { EditionMetadata, ResponseDocument } from "@devographics/types";
import { getEditionQuestions } from "~/lib/surveys/helpers";

export async function POST(
  req: NextRequest,
  { params }: RouteHandlerOptions<{ responseId: string }>
) {
  try {
    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    // Get responseId
    // TODO: this should be a route parameter instead
    const responseId = params.responseId;
    if (!responseId) {
      throw new ServerError({
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
      throw new ServerError({
        id: "invalid_data",
        message: "Found invalid data when parsing response data",
        status: 400,
      });
    }

    const { email, surveyId, editionId } = clientData;

    const edition = await fetchEditionMetadataSurveyForm({
      surveyId,
      editionId,
      calledFrom: "sendReadingList",
    });
    const survey = edition.survey;

    const RawResponse = await getRawResponsesCollection();
    const response = await RawResponse.findOne({
      _id: responseId,
    });

    const { subject, text, html } = getReadingListEmail({
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
    if (error instanceof ServerError) {
      return await error.toNextResponse(req);
    } else {
      return NextResponse.json(
        { error: `Could not send reading list` },
        { status: 500 }
      );
    }
  }
}

const getReadingListEmail = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  const { readingList } = response;
  const { survey } = edition;
  const allQuestions = getEditionQuestions(edition);
  const subject = `Your personalized ${survey.name} ${edition.year} reading list`;

  const props = { survey, edition };

  const getEntity = (itemId) =>
    allQuestions.find((q) => q.id === itemId)?.entity;

  const text = `
${textHeader(props)}

${readingList
  .map((itemId) => textItem({ ...props, entity: getEntity(itemId) }))
  .join("")}

${textFooter(props)}
`;

  const html = `
${htmlHeader(props)}

${readingList
  .map((itemId) => htmlItem({ ...props, entity: getEntity(itemId) }))
  .join("")}

${htmlFooter(props)}
`;
  return { subject, text, html };
};

// Plain text version
const textHeader = ({ survey, edition }) =>
  `Your ${survey.name} ${edition.year} Reading List`;

const textItem = ({ survey, edition, entity }) => `
${entity.nameClean}

${entity?.mdn?.summary || ""}

${[entity?.mdn?.url, entity?.github?.url, entity?.homepage?.url]
  .filter((l) => !!l)
  .map((l) => `- ${l}`)
  .join("<hr/>")}

------------------------
`;
const textFooter = ({ survey, edition }) =>
  `You are receiving this email because you completed the ${survey.name} ${edition.year} survey (${edition.questionsUrl}) and asked to receive a copy of your reading list. `;

// HTML version
const htmlHeader = (props) => `<h1>${textHeader(props)}</h1>`;

const htmlItem = ({ survey, edition, entity }) => `
<div>
    <h2>${entity?.nameClean}</h2>
    ${entity?.mdn?.summary ? `<p>${entity?.mdn?.summary}</p>` : ""}
    <div>
    <ul>
    ${[entity?.mdn?.url, entity?.github?.url, entity?.homepage?.url]
      .filter((l) => !!l)
      .map((l) => `<li>${l}</li>`)
      .join("\n")}
    </ul>
</div>
`;

const htmlFooter = (props) => `<hr/><p>${textFooter(props)}</p>`;
