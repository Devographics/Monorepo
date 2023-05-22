import { NextRequest, NextResponse } from "next/server";
import { tryGetCurrentUser } from "~/account/user/route-handlers/getters";
import { createResponse } from "~/lib/responses/db-actions/create";
import { ServerError } from "~/lib/server-error";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // Get current user
    const currentUser = await tryGetCurrentUser(req);

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

    const data = await createResponse({ clientData, currentUser });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof ServerError) {
      return await error.toNextResponse(req);
    } else {
      return NextResponse.json(
        { error: `Could not create response` },
        { status: 500 }
      );
    }
  }
}
