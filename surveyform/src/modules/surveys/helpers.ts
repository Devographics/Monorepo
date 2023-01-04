/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import { SerializedSurveyDocument, SurveyDocument } from "@devographics/core-models";
import { getQuestionObject } from "./parser/parseSurvey";

export const getCommentFieldName = fieldName => fieldName.replace("__experience", "__comment")

export const getSurveyFieldNames = (survey: SerializedSurveyDocument | SurveyDocument) => {
  let questionFieldNames: Array<string> = [];
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        const questionObject = getQuestionObject(questionOrId, section);
        /*
        const questionId = getQuestionId(
          survey,
          section,
          questionObject
        );
        */
        if (!questionObject.fieldName) {
          return;
        }
        questionFieldNames.push(questionObject.fieldName);
        if (questionObject.hasComment) {
          questionFieldNames.push(getCommentFieldName(questionObject.fieldName));
        }
      });
  });
  // remove dups (different suffix for same question)
  const fieldNamesWithoutDups = [...new Set(questionFieldNames).values()];
  return fieldNamesWithoutDups;
};
