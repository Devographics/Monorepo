import { NextRequest, NextResponse } from "next/server";
import { tryGetCurrentUser } from "~/account/user/route-handlers/getters";
import { populateUserResponses } from "~/lib/responses/db-actions/populateUserResponses";
import { ServerError } from "~/lib/server-error";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const currentUser = await tryGetCurrentUser(req);
    // NOTE: it's ok to not have a current user
    // since this endpoint is used client-side to check if the user is authenticated or not
    if (!currentUser) return NextResponse.json({ data: null })
    const currentUserWithResponse = await populateUserResponses({ user: currentUser });
    return NextResponse.json({ data: currentUserWithResponse });
  } catch (error) {
    if (error instanceof ServerError) {
      return await error.toNextResponse(req)
    } else {
      return NextResponse.json(
        { error: `Could not load currentUser` },
        { status: 500 }
      );
    }
  }
}
