import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { approveTokens } from "~/lib/normalization/actions/tokens/approveTokens";

export async function POST(req: NextRequest, res: NextResponse) {
  console.log("// approveTokens");
  try {
    // Get body data as JSON
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      throw err;
    }
    const data = await approveTokens(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "approveTokens_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
