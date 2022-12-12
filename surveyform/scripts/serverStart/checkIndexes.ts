/*

MongoDB indexes for geographic search and performance

*/

// import { ResponseConnector } from "~/modules/responses/model.server";
// import { NormalizedResponseConnector } from "~/modules/normalized_responses/model.server";
// import type { Model } from "mongoose";
import mongoose from "mongoose";
import {
  closeDbConnection,
  connectToAppDb,
  isLocalMongoUri,
} from "~/lib/server/mongoose/connection";

export const checkIndexes = async () => {
  await connectToAppDb();
  if (isLocalMongoUri()) {
    console.info("Checking index to local database");
  } else {
    console.info("Checking indexes to distant database");
  }

  const userCollection = mongoose.connection.db.collection("users");
  const responseCollection = mongoose.connection.db.collection("responses");

  const responseIndexes = await responseCollection.indexes()
  const userIndexes = await userCollection.indexes()

  if (!responseIndexes?.length) {
    console.warn("No mongo index found for Response collection. You need to run Survey Admin scripts to create indexes.")
  }
  if (!userIndexes?.length) {
    console.warn("No mongo index found for User collection. You need to run Survey Admin scripts to create indexes.")
  }
  await closeDbConnection();
};
