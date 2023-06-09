/*

MongoDB indexes for geographic search and performance

*/

import { getAppClient, getAppDb, getNormResponsesCollection, getRawResponsesCollection, getUsersCollection } from "@devographics/mongo";

export const createIndexes = async () => {
  await getAppDb();
  console.info("Adding index to database");

  const userCollection = await getUsersCollection()
  const responseCollection = await getRawResponsesCollection()
  const normalizedResponseCollection = await getNormResponsesCollection()
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
        // compound index for knowledge score ranking
        { surveySlug: 1, knowledgeScore: 1 },
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
  await (await getAppClient()).close()
};
