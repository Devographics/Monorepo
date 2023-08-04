import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import {
  UserDocument,
  UserDocumentWithResponses,
} from "~/account/user/typings";
import { ResponseDocument } from "@devographics/types";

/**
 * Add responses to user
 */
export async function populateUserResponses({
  user,
}: {
  user: UserDocument;
}): Promise<UserDocumentWithResponses> {
  connectToRedis();

  const RawResponses = await getRawResponsesCollection();
  const responses = (await RawResponses.find(
    { userId: user._id },
    {
      projection: {
        _id: 1,
        userId: 1,
        editionId: 1,
        surveyId: 1,
        updatedAt: 1,
        createdAt: 1,
        completion: 1,
      },
    }
  ).toArray()) as unknown as ResponseDocument[];

  return { ...user, responses };
}
