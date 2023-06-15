/** */
import { projectModelDefinition } from "./model";
import {
  createGraphqlModelServer,
  mergeModelDefinitionServer,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";

export const Project = createGraphqlModelServer(
  mergeModelDefinitionServer(projectModelDefinition, {
    graphql: {
      // read-only model
      mutationResolvers: {
        // TODO: null should disable the default resolvers
        //create: null,
        //update: null,
        //upsert: null,
        //delete: null,
      },
    },
    // @ts-ignore
    permissions: {
      canRead: ["guests"],
    },
  })
);