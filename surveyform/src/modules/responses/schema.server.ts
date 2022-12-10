import moment from "moment";
import surveys from "~/surveys";

import { getCompletionPercentage, getKnowledgeScore } from "./helpers";
import { VulcanGraphqlSchemaServer } from "@vulcanjs/graphql/server";
import { schema as schemaCommon } from "./schema";

import { getSurveyPath } from "~/modules/surveys/getters";
import { ResponseConnector } from "~/modules/responses/model.server";
import { extendSchemaServer } from "@devographics/core-models";

import { nanoid } from "nanoid";
import { ApiContext } from "~/lib/server/context";

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
      onCreate: ({ document, data }) => {
        return getCompletionPercentage({ ...document, ...data });
      },
      onUpdate: ({ document, data }) => {
        return getCompletionPercentage({ ...document, ...data });
      },
    },
    knowledgeScore: {
      onUpdate: ({ document }) => {
        return getKnowledgeScore(document).score;
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
          return surveys.find((s) => s.slug === response.surveySlug);
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

export default schema;
