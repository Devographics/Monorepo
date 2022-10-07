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
import { createMongooseConnector } from "@vulcanjs/mongo";

export const modelDef: CreateGraphqlModelOptionsServer =
  mergeModelDefinitionServer(modelDefCommon, {
    schema: schemaServer,
  });

/**
 * NOTE: this is a simplified version of "Responses"
 * without GraphQL callbacks, that should be defined
 * more precisely by each app
 * This is enough for the admin app only
 */
export const ResponseAdmin = createGraphqlModelServer(modelDef);

type ResponseDocument = any;
import mongoose from "mongoose";
// Using Vulcan (limited to CRUD operations)
export const ResponseAdminConnector = createMongooseConnector<ResponseDocument>(
  ResponseAdmin,
  {
    mongooseSchema: new mongoose.Schema({ _id: String, surveySlug: String }, { strict: false }),
  }
);
ResponseAdmin.crud.connector = ResponseAdminConnector;

// Using Mongoose (advised)
export const ResponseAdminMongooseModel =
  ResponseAdminConnector.getRawCollection() as mongoose.Model<ResponseDocument>;

/**
 * For direct Mongo access (not advised, used only for aggregations)
 * NOTE: should be called only after the database is connected,
 * that's why it's a function
 */
export const ResponseMongoCollection = () => {
  if (!mongoose.connection.db) {
    throw new Error(
      "Trying to access Response mongo collection before Mongo/Mongoose is connected."
    );
  }
  return mongoose.connection.db.collection<ResponseDocument>("responses");
};
