import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";

export async function loadCurrentUser({ currentUser }) {
  connectToRedis();

  const RawResponses = await getRawResponsesCollection();
  const userResponses = await RawResponses.find(
    { userId: currentUser._id },
    { projection: { _id: 1, userId: 1, editionId: 1, surveyId: 1 } }
  ).toArray();

  currentUser.responses = userResponses;

  return currentUser;
}
