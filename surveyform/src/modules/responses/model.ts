import schema from "./schema";
import { canModifyResponse } from "./helpers";
import {
  createGraphqlModel,
  CreateGraphqlModelOptionsShared,
} from "@vulcanjs/graphql";

const name = "Response";
export const modelDef: CreateGraphqlModelOptionsShared = {
  name,
  schema,
  graphql: {
    typeName: name,
    multiTypeName: "Responses",
    defaultFragmentOptions: {
      // Some fields might be named "js_features_intl"
      // because they literally talk about _intl
      // we don't want them in the default fragment
      // TODO: we should probably provide our own default fragment
      // without survey fields anyway
      noIntlFields: true,
    },
  },
  permissions: {
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    // canUpdate: ['owners', 'admins'],
    canUpdate: ({ user, document: response }) => {
      return canModifyResponse(response, user);
    },
    canDelete: ["admins"],
  },
};
export const Response = createGraphqlModel(modelDef);
// console.log("RESPONSE SCHEMA", Response.schema);
/*
export const Responses = createCollection({
  collectionName: "Responses",

  typeName: "Response",

  schema,

  permissions: {
    canRead: ["owners", "admins"],
    canCreate: ["members"],
    // canUpdate: ['owners', 'admins'],
    canUpdate: ({ user, document: response }) => {
      return canModifyResponse(response, user);
    },
    canDelete: ["admins"],
  },
});

export default Responses;


*/
