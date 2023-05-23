import type { ResponseDocument } from "@devographics/types";
import type {
  SurveyMetadata,
  EditionMetadata,
  SectionMetadata,
  QuestionMetadata,
} from "@devographics/types";
import { getFormPaths } from "~/lib/surveys/helpers";

export const getCompletionPercentage = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  let completedCount = 0;
  let totalCount = 0;
  edition.sections.forEach((section) => {
    section.questions &&
      section.questions.forEach((question) => {
        const formPaths = getFormPaths({ edition, question });
        const fieldName = formPaths.response;
        if (fieldName) {
          const answer = response[fieldName];
          const ignoreQuestion =
            question.template && ignoredFieldTypes.includes(question.template);
          if (!ignoreQuestion) {
            totalCount++;
            if (answer !== null && typeof answer !== "undefined") {
              completedCount++;
            }
          }
        }
      });
  });
  const completion = Math.round((completedCount * 100) / totalCount);
  return completion;
};

export const getKnowledgeScore = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  const featureSections = edition.sections.filter(
    (section) => section.slug === "features"
  );
  const featureFields = featureSections
    .map((s) => s.questions)
    // NOTE: the cast is mandatory here because typing of flat
    // is not ideal
    .flat() as Array<QuestionMetadata>;
  const unknownFields = featureFields.filter((field) => {
    //TODO: fields in "Response" probably have a slightly different type than fields in "Survey" (more attributes?)
    if (!field.id) throw new Error(`Field without id`);
    const value = response[field.id];
    return value !== "heard" && value !== "used";
  });
  const total = featureFields.length;
  const unknown = unknownFields.length;
  const known = total - unknown;
  return {
    total,
    unknown,
    known,
    score: Math.round((known * 100) / total),
    unknownFields,
  };
};

/**
 * Fields that do not count in the completion percentage or knowledge score
 */
export const ignoredFieldTypes = [
  "email",
  "email2",
  "receive_notifications",
  "help",
  "others",
  "project",
];

/**
 * Completion percentage of a section
 * @param section
 * @param response
 * @returns null if completion cannot be computed (no fillable question), the completion percentage
 * from 0 to 100 otherwise
 */
export const getSectionCompletionPercentage = ({
  edition,
  section,
  response,
}: {
  edition: EditionMetadata;
  section: SectionMetadata;
  response?: ResponseDocument;
}) => {
  if (!response || !section.questions) {
    return null;
  }
  // don't count text questions towards completion score
  // TODO: we may have array of fields in a question yet it doesn't seem supported
  const completableQuestions = section.questions.filter((question) => {
    const formPaths = getFormPaths({ edition, question });
    const fieldName = formPaths?.response!;
    // NOTE: if question has no template it's a valid one, it will use the default radiogroup input
    const isValidTemplate =
      !question.template || !ignoredFieldTypes.includes(question.template);
    const isCompletable = !!(isValidTemplate && fieldName);
    return isCompletable;
  });
  const questionsCount = completableQuestions.length;
  if (!questionsCount) return null;

  const completedQuestions = completableQuestions.filter((question) => {
    const formPaths = getFormPaths({ edition, question });
    const fieldName = formPaths?.response!;
    const isCompleted =
      response[fieldName] !== null &&
      typeof response[fieldName] !== "undefined";
    return isCompleted;
  });

  const completedQuestionsCount = completedQuestions.length;
  return Math.round((completedQuestionsCount / questionsCount) * 100);
};

export const getResponseEmail = ({
  existingResponse,
  survey,
  edition,
}: {
  existingResponse: ResponseDocument;
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  const emailSection = edition.sections.find((s) => s.id === "user_info");
  const emailQuestion = edition.sections
    .map((s) => s.questions)
    .flat()
    .find((q) => q.template === "email2");
  if (!emailSection || !emailQuestion) {
    return {};
  }
  const formPaths = getFormPaths({ edition, question: emailQuestion });
  const emailFieldPath = formPaths?.response;
  const email = emailFieldPath && existingResponse[emailFieldPath];
  return { email, emailFieldPath };
};
