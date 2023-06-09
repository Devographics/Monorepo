import moment from "moment";

import { getKnowledgeScore } from "./helpers";
import { VulcanGraphqlSchemaServer } from "@vulcanjs/graphql/server";
import { schema as schemaCommon } from "./schema";

import { getSurveyPath } from "~/modules/surveys/helpers";
import { ResponseConnector } from "~/modules/responses/model.server";
import { extendSchemaServer } from "@devographics/core-models";

import { nanoid } from "nanoid";
import { ApiContext } from "~/lib/server/context";
import { fetchSurveyFromId } from "@devographics/core-models/server";

export const schema: VulcanGraphqlSchemaServer = extendSchemaServer(
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
      onCreate: () => {
        return new Date();
      },
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
    knowledgeScore: {
      onUpdate: ({ document }) => {
        return getKnowledgeScore(document).score;
      },
    },
    locale: {
      onUpdate: async ({ document, context, currentUser }) => {
        return (context as ApiContext).locale;
      },
    },
    isNormalized: {
      onUpdate: () => {
        return false;
      },
    },

    // previously in API schema
    // TODO: syntax is probably wrong

    pagePath: {
      type: String,
      canRead: ["owners"],
      optional: true,
      resolveAs: {
        fieldName: "pagePath",
        type: "String",
        resolver: async (response) => getSurveyPath({ response }),
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
          const { surveySlug, knowledgeScore } = response;

          const totalResults = await ResponseConnector.count({
            surveySlug,
            knowledgeScore: { $exists: true },
          });

          const scoredAboveCount = await ResponseConnector.count({
            surveySlug,
            knowledgeScore: { $gt: knowledgeScore },
          });

          const scoreAbovePercent = Math.max(
            1,
            Math.round((scoredAboveCount * 100) / totalResults)
          );
          return scoreAbovePercent;
        },
      },
    },
  }
);

export default schema;
