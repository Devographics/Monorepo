/**
 * Used in http://localhost:3000/survey/state-of-graphql/2022/export
 *
 * Will be reused to add documentation to the normalized responses exports as well
 *
 */

import type {
  QuestionMetadata,
  SectionMetadata,
} from "@devographics/types";

interface MarkdownOptions {
  showFieldName?: boolean;
}
export const convertSurveyToMarkdown = ({
  formatMessage,
  entities,
  survey,
  options,
}: {
  formatMessage?: any;
  entities: any;
  // TODO: what's the right type here?
  survey: any;
  options?: MarkdownOptions;
}) => {
  let surveyString = "";
  surveyString += `# ${survey.name}\n\n`;
  survey?.outline?.forEach((section) => {
    surveyString += convertSection({
      formatMessage,
      entities,
      section,
      options,
    });
  });
  return surveyString;
};

const convertSection = ({
  formatMessage,
  entities,
  section,
  options,
}: {
  formatMessage?: any;
  entities?: any;
  section: SectionMetadata;
  options?: MarkdownOptions;
}) => {
  let sectionString = "";
  const { id, questions } = section;
  const title = formatMessage({ id: `sections.${id}.title` });
  const description = formatMessage({
    id: `sections.${id}.description`,
  });

  sectionString += `## ${title || id}\n\n`;

  if (description) sectionString += `${description}\n\n`;
  questions?.forEach((question) => {
    sectionString += convertQuestion({
      formatMessage,
      entities,
      question: question as unknown as QuestionMetadata,
      section,
      options,
    });
  });
  return sectionString;
};

const templateNeedsFieldName = (template?: string) => {
  return (
    template &&
    [
      "text",
      "longtext",
      "others",
      "others_textarea",
      "happiness",
      "single",
      "multiple",
      "opinion",
      "proficiency",
      "country",
      "bracket",
      "feature",
      "pattern",
      "tool",
      /** An autocomplete for the Project collection */
      "project",
      /** An autocomplete for the People collection */
      "people",
      "race_ethnicity",
    ].includes(template)
  );
};

const convertQuestion = ({
  formatMessage,
  entities,
  question,
  section,
  options: markdownOptions,
}: {
  formatMessage: any;
  entities: any;
  question: QuestionMetadata;
  section: SectionMetadata;
  options?: MarkdownOptions;
}) => {
  let questionString = "";
  const { id, options } = question;
  const entity = entities && entities.find((e) => e.id === id);

  const fullQuestionId = `${section.slug}.${id}`;

  const title = entity ? entity.name : formatMessage({ id: fullQuestionId });
  const description = formatMessage({
    id: `${section.slug}.${id}.description`,
  });

  questionString += `### ${title || id}\n\n`;
  if (description) questionString += `${description}\n\n`;

  const template = question.template || section.template;

  // add the field name (relevant for understanding the CSV/JSON exports of normalized responses)
  if (markdownOptions?.showFieldName && templateNeedsFieldName(template)) {
    questionString += `*Field name: ${fullQuestionId}*\n\n`;
  }

  switch (template) {
    case "country":
      questionString += "*list of countries goes here*\n\n";
      break;

    case "tool":
      // TODO: should be computed by translating the possible options for this template
      questionString +=
        "- Never heard|Would like to learn|Not interested|Would use again|Would not use again\n\n";
      break;

    case "feature":
      questionString += "- Never heard|Know what it is|Used it\n\n";
      break;

    default:
      Array.isArray(options) &&
        options?.forEach((option) => {
          questionString += convertOption({
            formatMessage,
            entities,
            question,
            option,
          });
        });
      break;
  }
  questionString += `\n`;

  return questionString;
};

const convertOption = ({ formatMessage, entities, question, option }) => {
  let optionString = "";
  const intlId = option.intlId || `options.${question.id}.${option.id}`;
  const entity = entities && entities.find((e) => e.id === option.id);

  const title = entity
    ? entity.name
    : formatMessage({
      id: intlId,
    });
  optionString += `- ${title || intlId}\n`;
  return optionString;
};
