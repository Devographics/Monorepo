import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { ServerError } from "~/lib/server-error";
import { ResponseDocument } from "@devographics/types";

export async function loadResponse({
  responseId,
  currentUser,
}: {
  responseId: string;
  currentUser: any;
}) {
  connectToRedis();

  const RawResponses = await getRawResponsesCollection<ResponseDocument>();
  const response = await RawResponses.findOne({ _id: responseId });
  if (!response) {
    throw new ServerError({
      id: "missing_response",
      message: `Could not find response ${responseId}`,
      status: 404,
    });
  }

  if (currentUser._id !== response.userId) {
    throw new ServerError({
      id: "not_authorized",
      message: `User ${currentUser._id} is not authorized to access response ${responseId}`,
      status: 404,
    });
  }

  return response;
}
