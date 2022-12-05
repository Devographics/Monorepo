/*

MongoDB indexes for geographic search and performance

*/

// import { ResponseConnector } from "~/modules/responses/model.server";
// import { NormalizedResponseConnector } from "~/modules/normalized_responses/model.server";
// import type { Model } from "mongoose";
import mongoose from "mongoose";
import {
  appDb,
  closeDbConnection,
  connectToAppDb,
  isDemoMongoUri,
  isLocalMongoUri,
  publicReadonlyDb,
} from "~/lib/server/mongoose/connection";

//NOTE: mongo use "createIndex" but mongoose use "index"
// @see https://mongoosejs.com/docs/api/schema.html#schema_Schema-index
export const createIndexes = async () => {
  if (isDemoMongoUri()) {
    console.warn("Using demo database, skip setting indexes");
    return;
  }
  await connectToAppDb();
  if (isLocalMongoUri()) {
    console.info("Adding index to local database");
  } else {
    console.info("Adding indexes to distant database");
  }

  const userCollection = appDb.db.collection("users");
  const responseCollection = appDb.db.collection("responses");
  const normalizedResponseCollection = publicReadonlyDb.db.collection(
    "normalized_responses"
  );
  /**
   * Example using Mongoose "index": the problem is that we cannot 
   * wait for indexes to be ready to close the connection, mongoose
   * doesn't use promises. It's easier to just call Mongo instead.
  // NOTE: future version of Vulcan should expose the right type
  const ResponseModel = ResponseConnector.getRawCollection() as Model<any>;
  const ResponseSchema = ResponseModel.schema;
  const NormalizedResponseSchema = (NormalizedResponseConnector.getRawCollection() as Model<any>)
    .schema;
 */
  await Promise.all(
    ([{ emailHash: 1 }, { createdAt: 1 }] as const).map(async (idxDef) => {
      await userCollection.createIndex(idxDef);
    })
  );
  await Promise.all(
    (
      [
        { userId: 1 },
        { surveySlug: 1 },
        { knowledgeScore: 1 },
        { createdAt: 1 },
        { updatedAt: 1 },
      ] as const
    ).map(async (idxDef) => {
      await responseCollection.createIndex(idxDef);
    })
  );
  await Promise.all(
    (
      [
        {
          responseId: 1,
        },
        { generatedAt: -1 },
      ] as const
    ).map(async (idxDef) => {
      await normalizedResponseCollection.createIndex(idxDef);
    })
  );

  await closeDbConnection();
};
