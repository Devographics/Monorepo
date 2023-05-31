import { NextRequest, NextResponse } from "next/server";
import { tryGetCurrentUser } from "~/account/user/route-handlers/getters";
import { RouteHandlerOptions } from "~/app/api/typings";
import { loadResponse } from "~/lib/responses/db-actions/load";
import { HandlerError } from "~/lib/handler-error";


export async function GET(req: NextRequest, { params }: RouteHandlerOptions<{ responseId: string }>) {
  try {
    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    // Get responseId
    const responseId = params.responseId
    // Defensive check: technically when using a route param, this should never happen
    if (!responseId) {
      throw new HandlerError({
        id: "missing_response_id",
        message: "Could not find responseId",
        status: 400,
      });
    }

    const data = await loadResponse({ responseId, currentUser });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof HandlerError) {
      return await error.toNextResponse(req)
    } else {
      return NextResponse.json(
        { error: `Could not load response` },
        { status: 500 }
      );
    }
  }
}
