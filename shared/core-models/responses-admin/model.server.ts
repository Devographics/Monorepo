/**
 * Simplified version of the Response model
 * for admin purpose
 */
import {
  CreateGraphqlModelOptionsServer,
  createGraphqlModelServer,
  mergeModelDefinitionServer,
} from "@vulcanjs/graphql/server";
import { modelDef as modelDefCommon } from "./model";
import { schema as schemaServer } from "./schema.server";

export const modelDef: CreateGraphqlModelOptionsServer =
  mergeModelDefinitionServer(modelDefCommon, {
    // @ts-ignore
    schema: schemaServer,
  });

/**
 * NOTE: this is a simplified version of "Responses"
 * without GraphQL callbacks, that should be defined
 * more precisely by each app
 * This is enough for the admin app only
 */
export const ResponseAdmin = createGraphqlModelServer(modelDef);