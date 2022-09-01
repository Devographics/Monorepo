/** */
import { projectModelDefinition } from "./model";
import {
  createGraphqlModelServer,
  mergeModelDefinitionServer,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import mongoose from "mongoose";

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

    permissions: {
      canRead: ["guests"],
    },
  })
);

type ProjectDocument = any;

// Create a Vulcan connector (only for CRUD operations internal to Vulcan)
const ProjectConnector = createMongooseConnector<ProjectDocument>(Project, {
  mongooseSchema: new mongoose.Schema({ _id: String }, { strict: false }),
});
Project.crud.connector = ProjectConnector;

// Expose the underlying Mongoose model (for custom operations)
export const ProjectMongooseModel =
  ProjectConnector.getRawCollection() as mongoose.Model<ProjectDocument>;
