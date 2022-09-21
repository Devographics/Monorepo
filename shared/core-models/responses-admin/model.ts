import schema from "./schema";
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
  },
  permissions: {
    canRead: ["admins", "admins"],
    canCreate: ["admins"],
    // canUpdate: ['owners', 'admins'],
    canUpdate: ["admins"],
    canDelete: ["admins"],
  },
};
export const Response = createGraphqlModel(modelDef);
