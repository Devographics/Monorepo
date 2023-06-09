import { createGraphqlModelServer } from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { NormalizedResponseDocument } from "../normalized_responses/model.server";

export const PrivateResponses = createGraphqlModelServer({
  name: "PrivateResponse",
  graphql: {
    typeName: "PrivateResponse",
    multiTypeName: "PrivateResponses",
    mutationResolvers: null,
    queryResolvers: null,
    //mutations: null,
    //resolvers: null,
  },
  schema: {
    _id: {
      type: String,
      optional: true,
      canRead: ["guests"],
    },
  },
});

// Mongoose model
const userInfoSchema = /*createSchema(*/ {
  github_username: {
    type: String,
    optional: false,
  },
  twitter_username: {
    type: String,
    optional: false,
  },
}; //);
/*
const privateResponseSchema = new mongoose.Schema({
  surveySlug: {
    type: String,
    optional: false,
  },
  responseId: {
    type: String,
    optional: false,
  },
  user_info: {
    type: userInfoSchema,
    optional: true,
  },
  emailExported: {
    type: Boolean,
    optional: true,
  },
});
*/

export default PrivateResponses;

/**
 *
 */
export interface PrivateResponseDocument
  extends Omit<NormalizedResponseDocument, "userInfo"> {
  user_info: {
    country?: string;
    // we don't store the email anymore even in private response
    // email?: string;
    emailHash?: string;
    // TODO: we shouldn't store that either? even in Private responses?
    github_username?: string;
    twitter_username?: string;
  };
}
