import { NextRequest, NextResponse } from "next/server";
import { DetailedErrorObject } from "~/lib/validation";
import { tryGetCurrentUser } from "~/account/user/route-handlers/getters";
import { loadResponse } from "~/lib/responses/db-actions/load";
import { ServerError } from "~/lib/server-error";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
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

    const data = await loadResponse({ responseId, currentUser });

    return NextResponse.json({ data });
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
