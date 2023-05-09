/*

MongoDB indexes for geographic search and performance

*/

// import { ResponseConnector } from "~/responses/model.server";
// import { NormalizedResponseConnector } from "~/modules/normalized_responses/model.server";
// import type { Model } from "mongoose";
// import mongoose from "mongoose";
// import {
//   closeDbConnection,
//   connectToAppDb,
//   isLocalMongoUri,
// } from "~/lib/server/mongoose/connection";
import {
  getRawResponsesCollection,
  getUsersCollection,
  isLocalMongoUri,
} from "@devographics/mongo";

export const checkIndexes = async () => {
  // await connectToAppDb();
  if (isLocalMongoUri()) {
    console.info("Checking index to local database");
  } else {
    console.info("Checking indexes to distant database");
  }

  const userCollection = await getUsersCollection();
  const responseCollection = await getRawResponsesCollection();

  const responseIndexes = await responseCollection.indexes();
  const userIndexes = await userCollection.indexes();

  if (!responseIndexes?.length) {
    console.warn(
      "No mongo index found for Response collection. You need to run Survey Admin scripts to create indexes."
    );
  }
  if (!userIndexes?.length) {
    console.warn(
      "No mongo index found for User collection. You need to run Survey Admin scripts to create indexes."
    );
  }
  // await closeDbConnection();
};
