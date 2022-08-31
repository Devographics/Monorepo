import mongoConnection from "./connection";

export const connectToAppDb = async () => {
  const mongoClient = await mongoConnection;
  return mongoClient.db();
};

/**
 * Get a collection
 * Guarantees that the database is connected before returning
 * @param collectionName
 * @returns
 */
export const getCollection = async (collectionName: string) => {
  const db = await connectToAppDb();
  return db.collection(collectionName);
};
