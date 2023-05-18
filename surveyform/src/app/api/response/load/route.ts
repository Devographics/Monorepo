import { NextRequest, NextResponse } from "next/server";
import { ServerError, ServerErrorObject } from "~/lib/validation";
import { tryGetCurrentUser } from "../../currentUser/getters";
import { loadResponse } from "~/actions/responses/load";

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
      const error_ = error as ServerErrorObject;
      return NextResponse.json({ error: error_ }, { status: error_.status });
    } else {
      return NextResponse.json(
        { error: `Could not load response` },
        { status: 500 }
      );
    }
  }
}
