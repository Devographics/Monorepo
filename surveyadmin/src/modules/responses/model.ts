import schema from "./schema";
import { canModifyResponse } from "./helpers";
import {
  createGraphqlModel,
  CreateGraphqlModelOptionsShared,
} from "@vulcanjs/graphql";
import { SurveyEdition } from "@devographics/core-models";


const name = "Response";
export const modelDef: CreateGraphqlModelOptionsShared = {
  name,
  schema,
  graphql: {
    typeName: name,
    multiTypeName: "Responses",
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
