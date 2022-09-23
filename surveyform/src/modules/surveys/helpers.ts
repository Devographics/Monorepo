/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import { SurveyDocument } from "@devographics/core-models";
import { getQuestionObject } from "../responses/parseSurvey";

export const getSurveyFieldNames = (survey: SurveyDocument) => {
  let questionFieldName: Array<string> = [];
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        if (Array.isArray(questionOrId)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
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
        questionFieldName.push(questionObject.fieldName);
      });
  });
  // remvoe dups (different suffix for same question)
  const fieldNamesWithoutDups = [...new Set(questionFieldName).values()];
  return fieldNamesWithoutDups;
};
