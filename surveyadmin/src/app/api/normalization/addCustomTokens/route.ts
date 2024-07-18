import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { addCustomTokens } from "~/lib/normalization/actions";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("// addCustomTokens");
  try {
    // Get body data as JSON
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      throw err;
    }
    const data = await addCustomTokens(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "addCustomTokens_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
