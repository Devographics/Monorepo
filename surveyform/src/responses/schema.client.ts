import { getQuestionSchema } from "./helpers";
import { VulcanGraphqlSchema } from "@vulcanjs/graphql";
import { getQuestionObject } from "~/surveys/parser/parseSurvey";
import { addComponentToQuestionObject } from "./customComponents";
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { SurveyEdition } from "@devographics/core-models";
import cloneDeep from "lodash/cloneDeep.js";
import { schema } from "./schema";
import { EditionMetadata } from "@devographics/types";

/**
 *
 *
 * Just put all questions for all surveys on the root of the schema
 */
// let i = 0;
/**
 * Have one schema per survey
 */
let schemaIsReady = false;
const schemaPerSurvey: { [slug: string]: VulcanGraphqlSchema } = {};

export function getSchemaPerSurvey(surveySlug: string) {
  if (!schemaIsReady)
    throw new Error("Cannot get schema for survey " + surveySlug);
  return schemaPerSurvey[surveySlug];
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
export function getSurveyResponseSchema(edition: EditionMetadata) {
  const coreSchema = cloneDeep(schema) as VulcanGraphqlSchema;
  const surveyResponseSchema = cloneDeep(coreSchema);
  edition.sections.forEach((section) => {
    section.questions &&
      section.questions.forEach((question) => {
        //i++;
        if (Array.isArray(question)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
        let questionObject = getQuestionObject({
          survey: edition.survey,
          edition,
          section,
          question,
        });
        questionObject = addComponentToQuestionObject(questionObject);
        const questionSchema = getQuestionSchema({
          questionObject,
          section,
        });

        const fieldName = questionObject?.formPaths?.response;
        surveyResponseSchema[fieldName] = questionSchema;

        if (questionObject.allowComment) {
          const commentSchema = addComponentToQuestionObject(
            getCommentSchema()
          ) as VulcanFieldSchema<any>;
          const commentQuestionId = questionObject?.formPaths?.comment;
          surveyResponseSchema[commentQuestionId] = commentSchema;
        }
      });
  });
  return surveyResponseSchema;
}
