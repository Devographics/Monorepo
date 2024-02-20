import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { HandlerError } from "~/lib/handler-error";
import { ResponseDocument } from "@devographics/types";

export async function loadResponse({
  responseId,
  currentUser,
}: {
  responseId: string;
  currentUser: any;
}) {
  connectToRedis();

  const RawResponses = await getRawResponsesCollection();
  const response = await RawResponses.findOne({ _id: responseId });
  if (!response) {
    throw new HandlerError({
      id: "missing_response",
      message: `Could not find response ${responseId}`,
      status: 404,
    });
  }

  if (currentUser._id !== response.userId) {
    throw new HandlerError({
      id: "not_authorized",
      message: `User ${currentUser._id} is not authorized to access response ${responseId}`,
      status: 404,
    });
  }

  return response;
}
