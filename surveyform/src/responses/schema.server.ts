import moment from "moment";

import {
  getCompletionPercentage,
  getKnowledgeScore,
  getQuestionSchema,
} from "./helpers";
import { VulcanGraphqlSchemaServer } from "@vulcanjs/graphql/server";
import { VulcanGraphqlSchema } from "@vulcanjs/graphql";
import { getCommentSchema, schema } from "./schema";

import { getEditionSectionPath } from "~/surveys/helpers";
import {
  extendSchemaServer,
  ResponseDocument,
  SurveyEdition,
} from "@devographics/core-models";

import { nanoid } from "nanoid";
import { ApiContext } from "~/lib/server/context";
import { fetchSurveysMetadata } from "@devographics/fetch";
import { SurveyEditionDescription } from "@devographics/core-models";
import cloneDeep from "lodash/cloneDeep.js";
import {
  getQuestionId,
  getQuestionObject,
  getSurveyEditionId,
} from "~/surveys/parser/parseSurvey";
import { VulcanFieldSchema } from "@vulcanjs/schema";
import { serverConfig } from "~/config/server";
import { Edition, EditionMetadata } from "@devographics/types";
import { fetchEditionMetadata } from "@devographics/fetch";

export const getServerSchema = (): VulcanGraphqlSchemaServer => {
  const schemaCommon = getSchema();
  return extendSchemaServer(schemaCommon, {
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
        const { surveyId, editionId } = document;
        const edition = await fetchEditionMetadata({ surveyId, editionId });
        return getCompletionPercentage({ ...document, ...data }, edition);
      },
      onUpdate: async ({ document, data }) => {
        const { surveyId, editionId } = document;
        const edition = await fetchEditionMetadata({ surveyId, editionId });
        return getCompletionPercentage({ ...document, ...data }, edition);
      },
    },
    knowledgeScore: {
      onUpdate: async ({ document }) => {
        const { surveyId, editionId } = document;
        const edition = await fetchEditionMetadata({ surveyId, editionId });
        return getKnowledgeScore(document, edition).score;
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
          const { surveyId, editionId } = response;
          const edition = await fetchEditionMetadata({ surveyId, editionId });
          if (!edition) return null;
          return getEditionSectionPath({ edition, response });
        },
      },
    },

    // TODO: for those "resolved from document" fields, only the resolveAs part matter
    // we should improve this scenario in Vulcan Next (previously was handled via apiSchema in Vulcan,
    // but we need something more integrated into the schema)
    edition: {
      type: Object,
      typeName: "Edition",
      blackbox: true,
      optional: true,
      canRead: ["owners"],
      resolveAs: {
        fieldName: "edition",
        typeName: "Edition",
        // TODO: use a relation instead
        resolver: async (response, args, context) => {
          const { surveyId, editionId } = response;
          return await fetchEditionMetadata({ surveyId, editionId });
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
          return 100;
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
  });
};

let schemaIsReady = false;
// global schema, useful server-side
export function getSchema() {
  if (!schemaIsReady)
    throw new Error("Calling get response schema before schema is ready");
  return schema;
}
const schemaPerSurvey: { [slug: string]: VulcanGraphqlSchema } = {};
// TODO: unused client-side?
export async function initResponseSchema(editions: Array<EditionMetadata>) {
  schemaIsReady = true;
  const coreSchema = cloneDeep(schema) as VulcanGraphqlSchema;
  editions.forEach((edition) => {
    const editionId = edition.id;
    if (editionId) {
      schemaPerSurvey[editionId] = cloneDeep(coreSchema);
    }
    edition.sections.forEach((section) => {
      let i = 0;
      section.questions &&
        section.questions.forEach((question) => {
          i++;

          let questionObject = getQuestionObject({
            survey: edition.survey,
            edition,
            section,
            question,
            number: i,
          });
          const questionSchema = getQuestionSchema({ questionObject, section });

          const questionId = question.rawPaths.response;
          if (!questionId) {
            throw new Error(
              `Question ${questionId} does not have a raw response path defined`
            );
          }
          schema[questionId] = questionSchema;
          if (editionId) {
            schemaPerSurvey[editionId][questionId] = questionSchema;
          }

          if (questionObject.allowComment) {
            const commentSchema = //addComponentToQuestionObject(
              getCommentSchema() as VulcanFieldSchema<any>;

            const commentQuestionId = question.rawPaths.comment;
            if (!commentQuestionId) {
              throw new Error(
                `Question ${questionId} does not have a raw comment path defined`
              );
            }
            schema[commentQuestionId] = commentSchema;
            if (editionId) {
              schemaPerSurvey[editionId][commentQuestionId] = commentSchema;
            }
          }
        });
    });
  });
}
// generate schema on the fly, used only in frontend for survey specific pages at the moment
export function getEditionResponseSchema(edition: EditionMetadata) {
  const coreSchema = cloneDeep(schema) as VulcanGraphqlSchema;
  const surveyResponseSchema = cloneDeep(coreSchema);
  edition.sections.forEach((section) => {
    section.questions &&
      section.questions.forEach((questionOrId) => {
        //i++;
        if (Array.isArray(questionOrId)) {
          // NOTE: from the typings, it seems that questions can be arrays? To be confirmed
          throw new Error("Found an array of questions");
        }
        let questionObject = getQuestionObject({ questionOrId, section });
        //questionObject = addComponentToQuestionObject(questionObject);
        const questionSchema = getQuestionSchema(
          questionObject,
          section,
          survey
        );

        const questionId = getQuestionId(edition, section, questionObject);
        surveyResponseSchema[questionId] = questionSchema;

        if (questionObject.suffix === "experience") {
          const commentSchema = //addComponentToQuestionObject(
            getCommentSchema() as VulcanFieldSchema<any>;
          //) as VulcanFieldSchema<any>;
          const commentQuestionId = getQuestionId(edition, section, {
            ...questionObject,
            suffix: "comment",
          });
          surveyResponseSchema[commentQuestionId] = commentSchema;
        }
      });
  });
  return surveyResponseSchema;
}
