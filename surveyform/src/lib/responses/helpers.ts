import {
  SurveyMetadata,
  EditionMetadata,
  SectionMetadata,
  QuestionMetadata,
  ResponseDocument,
  FeaturesOptions,
} from "@devographics/types";
import { getFormPaths } from "@devographics/templates";
import { getEditionQuestions } from "../surveys/helpers/getEditionQuestions";

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
        const ignoreQuestion =
          question.template && ignoredFieldTypes.includes(question.template);
        if (!ignoreQuestion) {
          totalCount++;
          if (questionIsCompleted({ edition, question, response })) {
            completedCount++;
          }
        }
      });
  });
  const completion = Math.round((completedCount * 100) / totalCount);
  return completion;
};

const getRank = (score) => {
  if (score < 10) {
    return "rank1";
  } else if (score < 30) {
    return "rank2";
  } else if (score < 50) {
    return "rank3";
  } else if (score < 70) {
    return "rank4";
  } else if (score < 90) {
    return "rank5";
  } else {
    return "rank6";
  }
};

export const getKnowledgeScore = ({
  response,
  edition,
}: {
  response: ResponseDocument;
  edition: EditionMetadata;
}) => {
  const scoredQuestions = getEditionQuestions(edition).filter(
    (q) => q.countsTowardScore
  );

  let known = 0;
  for (const question of scoredQuestions) {
    const formPaths = getFormPaths({ edition, question });
    const value = formPaths.response && response[formPaths.response];
    if (value) {
      if (Array.isArray(value)) {
        // assume this is a question where each array item is a feature that
        // counts towards the score
        known += value.length;
      } else {
        // assume this is a normal feature question
        if ([FeaturesOptions.HEARD, FeaturesOptions.USED].includes(value)) {
          known++;
        }
      }
    }
  }

  const total = scoredQuestions.length;
  const unknown = total - known;
  const score = Math.round((known * 100) / total);
  const rank = getRank(score);

  const result = {
    total,
    unknown,
    known,
    score,
    rank,
    // knownFields,
    // unknownFields,
  };
  return result;
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
  "quiz",
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
  const completableQuestions = section.questions
    .filter((q) => !q.hidden)
    .filter((question) => {
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

  const completedQuestions = completableQuestions.filter((question) =>
    questionIsCompleted({ edition, question, response })
  );

  const completedQuestionsCount = completedQuestions.length;
  return Math.round((completedQuestionsCount / questionsCount) * 100);
};

export const answerIsNotEmpty = (answer: any) =>
  !(
    typeof answer === "undefined" ||
    answer === null ||
    answer === "" ||
    (Array.isArray(answer) && answer.length === 0)
  );

export const questionIsCompleted = ({
  edition,
  question,
  response,
}: {
  edition: EditionMetadata;
  question: QuestionMetadata;
  response: ResponseDocument;
}) => {
  const formPaths = getFormPaths({ edition, question });
  const responsePath = formPaths.response;
  const otherPath = formPaths.other;
  const answer = responsePath && response[responsePath];
  const otherAnswer = otherPath && response[otherPath];
  const isCompleted = answerIsNotEmpty(answer) || answerIsNotEmpty(otherAnswer);
  return isCompleted;
};
