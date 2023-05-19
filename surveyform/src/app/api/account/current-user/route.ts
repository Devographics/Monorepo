import { NextRequest, NextResponse } from "next/server";
import { ServerError, ServerErrorObject } from "~/lib/validation";
import { tryGetCurrentUser } from "~/account/user/route-handlers/getters";
import { populateUserResponses } from "~/lib/responses/db-actions/populateUserResponses";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const currentUser = await tryGetCurrentUser(req);
    const currentUserWithResponse = await populateUserResponses({ user: currentUser });
    return NextResponse.json({ data: currentUserWithResponse });
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
