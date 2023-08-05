import {
  getNormResponsesCollection,
  getRawResponsesCollection,
} from "@devographics/mongo";

export const testDbConnection = async ({ limit = 20 }) => {
  const normResponses = await getNormResponsesCollection();
  const rawResponses = await getRawResponsesCollection();
  const normResponsesCount = await normResponses.countDocuments();
  const rawResponsesCount = await rawResponses.countDocuments();
  return { normResponsesCount, rawResponsesCount };
};

testDbConnection.description = `Test the connection to the private and public MongoDB databases.`;

export default testDbConnection;
