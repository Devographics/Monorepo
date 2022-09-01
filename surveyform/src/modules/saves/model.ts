import { createGraphqlModel, GraphqlModelDefinition } from "@vulcanjs/graphql";
import { schema } from "./schema";

const name = "Save";
export const modelDef: GraphqlModelDefinition = {
  name,
  schema,
  graphql: {
    typeName: name,
    multiTypeName: "Saves",
  },
  permissions: {
    canRead: ["owners", "admins"],
    canCreate: ["members"],
  },
};
/*
export const Save = createCollection({
  collectionName: "Saves",

  typeName: "Save",

  schema,

  // queries: null,

  mutations: {
    update: null,
    upsert: null,
    delete: null,
  },

  permissions: {
    canRead: ["owners", "admins"],
    canCreate: ["members"],
  },
});*/

export const Save = createGraphqlModel(modelDef);
