import { NextRequest, NextResponse } from "next/server";
import { tryGetCurrentUser } from "../../../../account/user/route-handlers/getters";
import { saveResponse } from "~/lib/responses/db-actions/save";
import { ServerError } from "~/lib/server-error";

export async function POST(req: NextRequest, res: NextResponse) {
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

    // Get body data as JSON
    let clientData: any;
    try {
      clientData = await req.json();
    } catch (err) {
      throw new ServerError({
        id: "invalid_data",
        message: "Found invalid data when parsing response data",
        status: 400,
      });
    }

    const data = await saveResponse({
      responseId,
      currentUser,
      clientData,
    });

    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ServerError) {
      return await error.toNextResponse(req)
    } else {
      return NextResponse.json(
        { error: `Could not update response` },
        { status: 500 }
      );
    }
  }
}
