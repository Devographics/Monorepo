import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { renameTokens } from "~/lib/normalization/actions/tokens/renameTokens";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("// renameTokens");
  try {
    // Get body data as JSON
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      throw err;
    }
    const data = await renameTokens(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "renameTokens_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
