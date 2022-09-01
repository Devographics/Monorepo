import { VulcanGraphqlSchema } from "@vulcanjs/graphql";
import { VulcanGraphqlFieldSchemaServer } from "@vulcanjs/graphql/server";
import merge from "lodash/merge.js";

// TODO: put this function in  Vulcan NPM graphql/server
export const extendSchemaServer = (
  fullSchema: VulcanGraphqlSchema,
  extensionSchema: { [key: string]: Partial<VulcanGraphqlFieldSchemaServer> }
) => {
  return merge({}, fullSchema, extensionSchema);
};
