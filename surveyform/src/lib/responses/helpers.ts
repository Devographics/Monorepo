import {
  SurveyMetadata,
  EditionMetadata,
  SectionMetadata,
  QuestionMetadata,
  ResponseDocument,
  FeaturesOptions,
  OPTION_NA,
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

export const getEditionScoredQuestions = (edition) => {};

class ScoredFeatures {
  items: string[] = [];
  counted: string[] = [];

  get total() {
    return this.items.length;
  }

  get count() {
    return this.counted.length;
  }

  get scoreRaw() {
    if (this.count === 0) {
      return 0;
    }

    return (100 * this.count) / this.total;
  }

  get score() {
    let digits = 0;
    let factor = 10 ** digits;
    return Math.round(factor * this.scoreRaw) / factor;
  }

  toString() {
    return `${this.score}% (${this.count}/${this.total})`;
  }
}

export const USED_PTS = 10;
export const HEARD_PTS = 5;
export const scoreWeights = { used: USED_PTS, heard: HEARD_PTS };

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

  const overall = new ScoredFeatures();
  const awareness = new ScoredFeatures();
  const usage = new ScoredFeatures();

  for (const question of scoredQuestions) {
    const formPaths = getFormPaths({ edition, question });
    const value_:
      | string
      | number
      | Array<string>
      | Array<number>
      | undefined
      | null = formPaths.response && response[formPaths.response];

    if (question.allowMultiple && question.options) {
      // assume this is a question where each array item is a scored item that
      // counts towards the score
      const optionsIds = question.options
        .map((o) => String(o.id))
        .filter((item) => item !== OPTION_NA);
      const value = (value_ || []) as Array<string>;

      // We assume all mini-features currently measure only usage
      // If in the future we have awareness mini-features, we need to change this logic
      overall.items.push(...optionsIds);
      usage.items.push(...optionsIds);

      let usedIds = optionsIds.filter((id) => value.includes(id));
      overall.counted.push(...usedIds);
      usage.counted.push(...usedIds);
    } else {
      // assume this is a normal feature question
      overall.items.push(question.id);
      awareness.items.push(question.id);
      usage.items.push(question.id);

      const value = value_ as FeaturesOptions;
      if ([FeaturesOptions.HEARD, FeaturesOptions.USED].includes(value)) {
        overall.counted.push(question.id);
        (value === FeaturesOptions.HEARD ? awareness : usage).counted.push(
          question.id
        );
      }
    }
  }

  return {
    total: overall.total,
    known: overall.count,
    score:
      scoreWeights.used * usage.count + scoreWeights.heard * awareness.count,
    usage,
    awareness,
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
  "quiz",
  "textList",
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
