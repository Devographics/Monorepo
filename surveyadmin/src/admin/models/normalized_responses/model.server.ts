import { createGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import {
  ResponseAdmin,
  ResponseDocument,
} from "@devographics/core-models/server";
import { SurveyEdition } from "@devographics/core-models";
import { nanoid } from "nanoid";
import { publicReadonlyDb } from "~/lib/server/mongoose/connection";

export const NormalizedResponse = createGraphqlModelServer({
  name: "Normalized_Response",
  schema: {
    _id: {
      type: String,
      optional: true,
      canRead: ["admins"],

      // MANDATORY when using string ids for a collection instead of ObjectId
      // you have to handle the id creation manually
      onCreate: () => {
        // generate a random value for the id
        const _id = nanoid();
        return _id;
      },
    },
    responseId: {
      type: String,
      optional: true,
      //canRead: ["admins"],
      canRead: ["guests", "anyone"],
      canCreate: ["guests", "anyone"],
      canUpdate: ["guests", "anyone"],

      // If you need more advanced extension to Response graphql schema
      // just write them as custom resolvers, using the "extend" syntax of graphql
      // (this is what reversedRelation does under the hood for basic use cases)
      // do NOT import NormalizedResponse in the core Response model
      reversedRelation: {
        // ResponseAdmin is just the "skeleton" of Response
        // because we don't need the full-fledged Vulcan model here with cb and all,
        // just the right graphql model
        model: ResponseAdmin,
        kind: "hasOneReversed",
        foreignFieldName: "normalizedResponse",
      },
    },
  },
  graphql: {
    typeName: "NormalizedResponse",
    multiTypeName: "NormalizedResponses",
    // no default mutations and resolvers => set explicitely to null deactivate the resolvers generation
    mutationResolvers: null,
    queryResolvers: null,
    /*
    mutations: null,
    resolvers: null,*/
  },
  permissions: {
    canRead: ["guests", "anyone"],
    canCreate: ["guests", "anyone"],
  },

  // TODO: how is it used?
  // dbCollectionName: 'normalized_responses',
});

export const NormalizedResponseMongoCollection = () => {
  // db = the mongo instance
  if (!publicReadonlyDb.db) {
    throw new Error(
      "Trying to access Response mongo collection before Mongo/Mongoose is connected."
    );
  }
  return publicReadonlyDb.db.collection<ResponseDocument>("normalized_responses");
};


export interface NormalizedResponseDocument extends ResponseDocument {
  responseId: ResponseDocument["_id"];
  generatedAt: Date;
  survey: SurveyEdition["context"];
  year: SurveyEdition["year"];
  user_info: {
    country?: string;
    // Here, we store only PUBLIC data
    // email?: string;
    // hash?: string;
    // github_username?: string;
    // twitter_username?: string;
  };
}
