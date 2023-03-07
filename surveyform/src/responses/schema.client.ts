import { getQuestionSchema } from "./helpers";
import { VulcanGraphqlSchema } from "@vulcanjs/graphql";
import {
  getQuestionId,
  getQuestionObject,
} from "~/surveys/parser/parseSurvey";
import { addComponentToQuestionObject } from "./customComponents";
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { SurveyEdition } from "@devographics/core-models";
import cloneDeep from "lodash/cloneDeep.js";
import { schema } from "./schema";


/**
 *
 *
 * Just put all questions for all surveys on the root of the schema
 */
// let i = 0;
/**
 * Have one schema per survey
 */
let schemaIsReady = false
const schemaPerSurvey: { [slug: string]: VulcanGraphqlSchema } = {};

export function getSchemaPerSurvey(surveySlug: string) {
  if (!schemaIsReady) throw new Error("Cannot get schema for survey " + surveySlug)
  return schemaPerSurvey[surveySlug]
}

export const getCommentSchema = () => ({
  type: String,
  input: "hidden",
  optional: true,
  canRead: ["owners", "admins"],
  canCreate: ["members"],
  canUpdate: ["owners", "admins"],
});



// generate schema on the fly, used only in frontend for survey specific pages at the moment
export function getSurveyResponseSchema(survey: SurveyEdition | SurveyEdition) {
  const coreSchema = cloneDeep(schema) as VulcanGraphqlSchema;
  const surveyResponseSchema = cloneDeep(coreSchema);
  survey.outline.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        //i++;
        if (Array.isArray(questionOrId)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
        let questionObject = getQuestionObject(questionOrId, section);
        questionObject = addComponentToQuestionObject(questionObject);
        const questionSchema = getQuestionSchema(
          questionObject,
          section,
          survey
        );

        const questionId = getQuestionId(survey, section, questionObject);
        surveyResponseSchema[questionId] = questionSchema;

        if (questionObject.suffix === "experience") {
          const commentSchema = addComponentToQuestionObject(
            getCommentSchema()
          ) as VulcanFieldSchema<any>;
          const commentQuestionId = getQuestionId(survey, section, {
            ...questionObject,
            suffix: "comment",
          });
          surveyResponseSchema[commentQuestionId] = commentSchema;
        }
      });
  });
  return surveyResponseSchema
}

