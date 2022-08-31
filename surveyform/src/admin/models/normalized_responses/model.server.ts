import { Field, SurveyType } from "~/surveys";
import { createGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";

import { nanoid } from "nanoid";

export const NormalizedResponse = createGraphqlModelServer({
  name: "Normalized_Response",
  schema: {
    _id: {
      type: String,
      optional: true,
      canRead: ["guests"],

      // MANDATORY when using string ids for a collection instead of ObjectId
      // you have to handle the id creation manually
      onCreate: () => {
        // generate a random value for the id
        const _id = nanoid();
        return _id;
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

  // TODO: how is it used?
  // dbCollectionName: 'normalized_responses',
});

/**
 * TODO: currently we have to import this in the "Response" model
 * In the future this should be instead tied to the "NormalizedResponse" model
 * To avoid a dependency Response->NormalizedResponse (we only want NormalizedResponse->Response)
 * @see https://github.com/VulcanJS/vulcan-npm/issues/133
 */
export const responseSchemaExtension = {
  /**
   * TODO: this creates a strong dependency to the admin area
   * And this field is only used in admin display
   *
   * Possible solutions:
   * - put the NormalizedResponse model and Response model into a shared folder
   * - find a way to extend the Response model based on NormalizedResponse
   *
   * + we could create a relation resolver for this in Vulcan for those
   * kind of "virtual" relations (the foreign key is in the related model instead of the current model)
   *
   * @see https://github.com/VulcanJS/vulcan-npm/issues/133
   *
   */
  normalizedResponse: {
    type: Object,
    typeName: "JSON",
    blackbox: true,
    optional: true,
    canRead: ["owners"],
    resolveAs: {
      fieldName: "normalizedResponse",
      typeName: "JSON",
      // TODO: use a relation instead
      resolver: async (response: ResponseDocument) => {
        return await NormalizedResponseConnector.findOne({
          responseId: response._id,
        });
      },
    },
  },
};

import mongoose from "mongoose";
import { ResponseDocument, ResponseType } from "~/modules/responses";

export const NormalizedResponseConnector =
  createMongooseConnector<NormalizedResponseDocument>(
    NormalizedResponse,

    {
      mongooseSchema: new mongoose.Schema({ _id: String }, { strict: false }),
    }
  );

export default NormalizedResponse;

NormalizedResponse.crud.connector = NormalizedResponseConnector;

export const NormalizedResponseMongooseModel =
  NormalizedResponseConnector.getRawCollection() as mongoose.Model<NormalizedResponseDocument>;
// For direct Mongo access
/*
export const NormalizedResponseCollection = mongoose.connection.db.collection(
  "normalized_responses"
);
*/

export interface NormalizedResponseDocument extends ResponseType {
  responseId: ResponseType["_id"];
  generatedAt: Date;
  survey: SurveyType["context"];
  year: SurveyType["year"];
  user_info: {
    country?: string;
    // Here, we store only PUBLIC data
    // email?: string;
    // hash?: string;
    // github_username?: string;
    // twitter_username?: string;
  };
}
