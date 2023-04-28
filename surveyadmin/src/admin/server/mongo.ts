import { Survey } from "@devographics/types";
import { MongoClient } from "mongodb";

const dbs = {};

export const getMongoDb = async ({ dbUri, dbName }) => {
  if (dbs[dbName]) {
    return dbs[dbName];
  } else {
    const mongoClient = new MongoClient(dbUri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      connectTimeoutMS: 10000,
    });

    await mongoClient.connect();

    dbs[dbName] = mongoClient.db(dbName);
    return dbs[dbName];
  }
};

export const getRawCollection = async (survey?: Survey) => {
  const db = await getMongoDb({
    dbUri: process.env.MONGO_URI,
    dbName: "production",
  });
  return db.collection("responses");
};

export const getNormCollection = async (survey?: Survey) => {
  const db = await getMongoDb({
    dbUri: process.env.MONGO_URI_PUBLIC_READONLY,
    dbName: "public",
  });
  return db.collection(survey?.dbCollectionName || "normalized_responses");
};

export const getUsersCollection = async () => {
  const db = await getMongoDb({
    dbUri: process.env.MONGO_URI,
    dbName: "production",
  });
  return db.collection("users");
};
