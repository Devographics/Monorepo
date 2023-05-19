import { NextRequest, NextResponse } from "next/server";
import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { tryGetCurrentUser } from "../../../../account/user/route-handlers/getters";
import { ServerError } from "~/lib/server-error";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    connectToRedis();

    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    // Get responseId
    const responseId = req.nextUrl.searchParams.get("responseId");
    if (!responseId) {
      throw new ServerError({
        id: "missing_response_id",
        message: "Could not find responseId",
        status: 400,
      });
    }

    const RawResponses = await getRawResponsesCollection();
    const response = await RawResponses.findOne({ _id: responseId });
    if (!response) {
      throw new ServerError({
        id: "missing_response_",
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

    return NextResponse.json({ data: response });
  } catch (error) {
    if (error instanceof ServerError) {
      return await error.toNextResponse(req)
    } else {
      return NextResponse.json(
        { error: `Could not load response` },
        { status: 500 }
      );
    }
  }
}
