import { NextRequest, NextResponse } from "next/server";
import { ServerError, ServerErrorObject } from "~/lib/validation";
import { tryGetCurrentUser } from "../getters";
import { loadCurrentUser } from "~/actions/users/loadCurrent";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const currentUser = await tryGetCurrentUser(req);
    const data = await loadCurrentUser({ currentUser });
    return NextResponse.json({ data });
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
