/**
 * Do NOT import all surveys, these helpers works at survey level
 * This avoid bundling all surveys in a page
 */
import { SurveyDocument } from "@devographics/core-models";
import { getQuestionSchema } from "../responses/helpers";
import {
  getQuestionFieldName,
  getQuestionObject,
} from "../responses/parseSurvey";

export const getSurveyFieldNames = (survey: SurveyDocument) => {
  let questionFieldName: Array<string> = [];
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        if (Array.isArray(questionOrId)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
        const questionObject = getQuestionObject(questionOrId /*, section, i*/);
        /*
        const questionId = getQuestionFieldName(
          survey,
          section,
          questionObject
        );
        */
        const questionSchema = getQuestionSchema(
          questionObject,
          section,
          survey
        );
        if (!questionObject.fieldName) {
          return;
        }
        questionFieldName.push(questionObject.fieldName);
      });
  });
  return questionFieldName;
};
