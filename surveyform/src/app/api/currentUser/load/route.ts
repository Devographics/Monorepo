import { NextRequest, NextResponse } from "next/server";
import { connectToRedis } from "~/lib/server/redis";
import { getRawResponsesCollection } from "@devographics/mongo";
import { ServerError, ServerErrorObject } from "~/lib/validation";
import { tryGetCurrentUser } from "../getters";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    connectToRedis();

    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    const RawResponses = await getRawResponsesCollection();
    const userResponses = await RawResponses.find(
      { userId: currentUser._id },
      { projection: { _id: 1, userId: 1, editionId: 1, surveyId: 1 } }
    ).toArray();

    currentUser.responses = userResponses;

    return NextResponse.json({ data: currentUser });
  } catch (error) {
    if (error instanceof ServerError) {
      const error_ = error as ServerErrorObject;
      return NextResponse.json({ error: error_ }, { status: error_.status });
    } else {
      return NextResponse.json(
        { error: `Could not load currentUser` },
        { status: 500 }
      );
    }
  }
}
