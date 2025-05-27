import {
  getEditionEntities,
  getInterestedItems,
} from "~/lib/surveys/helpers/getEditionQuestions";
import {
  getEntityDescription,
  getEntityDescriptionHtml,
  getEntityName,
} from "~/lib/surveys/helpers/getEntityName";
import {
  Edition,
  EditionMetadata,
  Entity,
  ResponseDocument,
  SurveyMetadata,
} from "@devographics/types";

export const getReadingListEmail = async ({
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

  const hasReadingList = readingList?.length > 0;

  const entities = hasReadingList
    ? getEditionEntities(edition).filter((entity) =>
        readingList.includes(entity.id)
      )
    : getInterestedItems(edition, response).map((q) => q.entity!);

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
  const description = getEntityDescription(entity);

  return `
${getEntityName(entity)}

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

const htmlItem = ({ /*survey, edition,*/ entity }: { entity: Entity }) => {
  const description = getEntityDescriptionHtml(entity);

  return `
<div>
    <h2>${getEntityName(entity)}</h2>

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
