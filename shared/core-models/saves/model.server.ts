import {
  createGraphqlModelServer,
  GraphqlModelDefinitionServer,
  mergeModelDefinitionServer,
} from "@vulcanjs/graphql/server";
import { modelDef as modelDefCommon } from "./model";
import { schema as schemaServer } from "./schema.server";

export const modelDef: GraphqlModelDefinitionServer =
  mergeModelDefinitionServer(modelDefCommon, {
    // @ts-ignore
    schema: schemaServer,
    graphql: {
      //mutationResolvers: {
      /*
        TODO: we cannot yet disable only certain mutations
        update: null,
        upsert: null,
        delete: null,
        */
      //},
    },
  });

export const Save = createGraphqlModelServer(modelDef);

