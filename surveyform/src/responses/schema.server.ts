import moment from "moment";

import { getCompletionPercentage, getKnowledgeScore, getQuestionSchema } from "./helpers";
import { VulcanGraphqlSchemaServer } from "@vulcanjs/graphql/server";
import { VulcanGraphqlSchema } from "@vulcanjs/graphql";
import { getCommentSchema, schema } from "./schema";

import { getSurveySectionPath } from "~/surveys/helpers";
import { extendSchemaServer, ResponseDocument, SurveyEdition } from "@devographics/core-models";

import { nanoid } from "nanoid";
import { ApiContext } from "~/lib/server/context";
import { fetchSurveyFromId, fetchSurveysList } from "@devographics/core-models/server";
import { SurveyEditionDescription } from "@devographics/core-models";
import cloneDeep from "lodash/cloneDeep.js";
import { getQuestionId, getQuestionObject } from "~/surveys/parser/parseSurvey";
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { serverConfig } from "~/config/server";


const getSurveyDescriptionFromResponse = async (response: ResponseDocument): Promise<SurveyEditionDescription | undefined> => {
  const isDevOrTest = serverConfig().isDev || serverConfig().isTest;
  const surveys = await fetchSurveysList(isDevOrTest)
  return surveys.find((s) => s.slug === response.surveySlug);
}

export const getServerSchema = (): VulcanGraphqlSchemaServer => {
  const schemaCommon = getSchema()
  return extendSchemaServer(
    schemaCommon,
    {
      // MANDATORY when using string ids for a collection instead of ObjectId
      // you have to handle the id creation manually
      _id: {
        onCreate: () => {
          // generate a random value for the id
          const _id = nanoid();
          return _id;
        },
      },
      common__user_info__authmode: {
        onCreate: ({ currentUser }) => {
          return currentUser?.authMode;
        },
      },
      createdAt: {
        onCreate: () => {
          return new Date();
        },
      },
      updatedAt: {
        onUpdate: () => {
          return new Date();
        },
      },
      finishedAt: {
        onUpdate: ({ data }) => {
          if (data.isFinished) {
            return new Date();
          }
        },
      },
      year: {
        onCreate: () => {
          return new Date().getFullYear();
        },
      },
      duration: {
        onUpdate: ({ document }) => {
          return moment(document.updatedAt).diff(
            moment(document.createdAt),
            "minutes"
          );
        },
      },
      completion: {
        onCreate: async ({ document, data }) => {
          const survey = await fetchSurveyFromId(document.surveySlug)
          return getCompletionPercentage({ ...document, ...data }, survey);
        },
        onUpdate: async ({ document, data }) => {
          const survey = await fetchSurveyFromId(document.surveySlug)
          return getCompletionPercentage({ ...document, ...data }, survey);
        },
      },
      knowledgeScore: {
        onUpdate: async ({ document }) => {
          const response = document as ResponseDocument
          if (!response.surveySlug) {
            throw new Error(`Can't compute knowledge score, response ${response._id} has no surveySLug`)
          }
          const survey = await fetchSurveyFromId(response.surveySlug)
          return getKnowledgeScore(response, survey).score;
        },
      },
      locale: {
        onCreate: async ({ document, context, currentUser }) => {
          return (context as ApiContext).locale;
        },
        onUpdate: async ({ document, context, currentUser }) => {
          return (context as ApiContext).locale;
          /*
          TODO: this should be computed when creating the context
          Currently we get the locale from Accept-Language or explicit cookies,
          not from the deb
          const user = await UserMongooseModel.findOne({
            _id: document.userId,
          }).exec();
          if (!user)
            throw new Error(
              `Could not update locale, user with id "${document.userId}" not found`
            );
          return user && user.locale;
          */
        },
      },
      isNormalized: {
        onUpdate: () => {
          return false;
        },
      },

      pagePath: {
        type: String,
        canRead: ["owners"],
        optional: true,
        resolveAs: {
          fieldName: "pagePath",
          type: "String",
          resolver: async (response) => {
            const surveyDescription = await getSurveyDescriptionFromResponse(response)
            if (!surveyDescription) return null
            return getSurveySectionPath({ survey: surveyDescription, response })
          },
        },
      },

      // TODO: for those "resolved from document" fields, only the resolveAs part matter
      // we should improve this scenario in Vulcan Next (previously was handled via apiSchema in Vulcan,
      // but we need something more integrated into the schema)
      survey: {
        type: Object,
        typeName: "Survey",
        blackbox: true,
        optional: true,
        canRead: ["owners"],
        resolveAs: {
          fieldName: "survey",
          typeName: "Survey",
          // TODO: use a relation instead
          resolver: async (response, args, context) => {
            if (!response.surveySlug) {
              throw new Error(`Can't get response survey, response ${response._id} has no surveySlug`)
            }
            return await fetchSurveyFromId(response.surveySlug)
          },
        },
      },

      knowledgeRanking: {
        type: Number,
        canRead: ["owners"],
        optional: true,
        typeName: "Int",
        resolveAs: {
          fieldName: "knowledgeRanking",
          typeName: "Int",
          resolver: async (response) => {
            // TODO: check if this is messing with db perf? add indexes?
            // @see https://github.com/Devographics/Monorepo/issues/172
            return 100
            // const { surveySlug, knowledgeScore } = response;

            // const totalResults = await ResponseConnector.count({
            //   surveySlug,
            //   knowledgeScore: { $exists: true },
            // });

            // const scoredAboveCount = await ResponseConnector.count({
            //   surveySlug,
            //   knowledgeScore: { $gt: knowledgeScore },
            // });

            // const scoreAbovePercent = Math.max(
            //   1,
            //   Math.round((scoredAboveCount * 100) / totalResults)
            // );
            // return scoreAbovePercent;
          },
        },
      },
    }
  );
}


let schemaIsReady = false
// global schema, useful server-side
export function getSchema() {
  if (!schemaIsReady) throw new Error("Calling get response schema before schema is ready")
  return schema
}
const schemaPerSurvey: { [slug: string]: VulcanGraphqlSchema } = {};
// TODO: unused client-side?
export async function initResponseSchema(surveys: Array<SurveyEdition>) {
  schemaIsReady = true
  const coreSchema = cloneDeep(schema) as VulcanGraphqlSchema;
  surveys.forEach((survey) => {
    if (survey.slug) {
      schemaPerSurvey[survey.slug] = cloneDeep(coreSchema);
    }
    survey.outline.forEach((section) => {
      section.questions &&
        section.questions.forEach((questionOrId) => {
          //i++;
          if (Array.isArray(questionOrId)) {
            // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
            throw new Error("Found an array of questions");
          }
          let questionObject = getQuestionObject(questionOrId, section);
          //questionObject = addComponentToQuestionObject(questionObject);
          const questionSchema = getQuestionSchema(
            questionObject,
            section,
            survey
          );

          const questionId = getQuestionId(survey, section, questionObject);
          schema[questionId] = questionSchema;
          if (survey.slug) {
            schemaPerSurvey[survey.slug][questionId] = questionSchema;
          }

          if (questionObject.suffix === "experience") {
            const commentSchema = //addComponentToQuestionObject(
              getCommentSchema() as VulcanFieldSchema<any>;
            const commentQuestionId = getQuestionId(survey, section, {
              ...questionObject,
              suffix: "comment",
            });
            schema[commentQuestionId] = commentSchema;
            if (survey.slug) {
              schemaPerSurvey[survey.slug][commentQuestionId] = commentSchema;
            }
          }
        });
    });
  });
}
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
        //questionObject = addComponentToQuestionObject(questionObject);
        const questionSchema = getQuestionSchema(
          questionObject,
          section,
          survey
        );

        const questionId = getQuestionId(survey, section, questionObject);
        surveyResponseSchema[questionId] = questionSchema;

        if (questionObject.suffix === "experience") {
          const commentSchema = //addComponentToQuestionObject(
            getCommentSchema() as VulcanFieldSchema<any>
          //) as VulcanFieldSchema<any>;
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

