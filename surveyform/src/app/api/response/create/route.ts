import { NextRequest, NextResponse } from "next/server";
import { tryGetCurrentUser } from "../../currentUser/getters";
import { ServerError, ServerErrorObject } from "~/lib/validation";
import { createResponse } from "~/actions/responses/create";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // Get current user
    const currentUser = await tryGetCurrentUser(req);

    // Get body data as JSON
    let clientData: any;
    try {
      clientData = await req.json();
      console.log("// clientData");
      console.log(clientData);
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
      const error_ = error as ServerErrorObject;
      return NextResponse.json({ error: error_ }, { status: error_.status });
    } else {
      return NextResponse.json(
        { error: `Could not create response` },
        { status: 500 }
      );
    }
  }
}
