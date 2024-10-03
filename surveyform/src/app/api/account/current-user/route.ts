import { NextRequest, NextResponse } from "next/server";
import { populateUserResponses } from "~/lib/responses/db-actions/populateUserResponses";
import { HandlerError } from "~/lib/handler-error";
import { handlerCurrentUser } from "~/lib/users/route-handlers/getters";

// TODO: it seems that 'auto' always give a 304 on this endpoint,
// despite using "req"
// Need to create a minimal repro to verify what happens, 
// perhaps not calling "cookies()" explicitely is the issue
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const currentUser = await handlerCurrentUser(req);
    // NOTE: it's ok to not have a current user
    // since this endpoint is used client-side to check if the user is authenticated or not
    if (!currentUser) return NextResponse.json({ data: null })
    const currentUserWithResponse = await populateUserResponses({ user: currentUser });
    return NextResponse.json({ data: currentUserWithResponse });
  } catch (error) {
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req)
    } else {
      return NextResponse.json(
        { error: `Could not load currentUser` },
        { status: 500 }
      );
    }
  }
}
