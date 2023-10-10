import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { getEditionQuestions } from "./getEditionQuestions";
import { getQuestionObject } from "./getQuestionObject";

/**
 * Normalizable = question has a free text "other" path
 */
export const getNormalizableQuestions = ({
  survey,
  edition,
}: {
  survey: SurveyMetadata;
  edition: EditionMetadata;
}) => {
  const allQuestions = getEditionQuestions(edition);
  const questions = allQuestions.filter((question) => {
    const questionObject = getQuestionObject({
      survey,
      edition,
      section: question.section,
      question,
    });
    const rawPaths = questionObject?.rawPaths;
    return rawPaths?.other;
  });
  // also add source
  // fields.push({ id: "source", fieldName: "common__user_info__source" });
  return questions;
};
