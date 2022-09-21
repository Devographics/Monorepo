import mongoose from "mongoose";
import {
  CreateGraphqlModelOptionsServer,
  createGraphqlModelServer,
  GraphqlModelDefinitionServer,
  mergeModelDefinitionServer,
} from "@vulcanjs/graphql/server";
import { createMongooseConnector } from "@vulcanjs/mongo";
import { modelDef as modelDefCommon } from "./model";
import { schema as schemaServer } from "./schema.server";

export const modelDef: GraphqlModelDefinitionServer =
  mergeModelDefinitionServer(modelDefCommon, {
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

type SaveDocument = any;

const SaveConnector = createMongooseConnector<SaveDocument>(
  Save,

  {
    mongooseSchema: new mongoose.Schema({ _id: String }, { strict: false }),
  }
);

Save.crud.connector = SaveConnector;

// Using Mongoose (advised)
export const SaveMongooseModel =
  SaveConnector.getRawCollection() as mongoose.Model<SaveDocument>;

// For direct Mongo access (not advised, used only for aggregations)
export const SaveMongoCollection = () => {
  if (!mongoose.connection.db) {
    throw new Error(
      "Trying to access Saves mongo collection before Mongo/Mongoose is connected."
    );
  }
  return mongoose.connection.db.collection<SaveDocument>("saves");
};
