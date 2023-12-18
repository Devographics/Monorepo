import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { removeCustomTokens } from "~/lib/normalization/actions";


export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // Get body data as JSON
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      throw err;
      //   throw new HandlerError({
      //     id: "invalid_data",
      //     message: "Found invalid data when parsing response data",
      //     status: 400,
      //   });
    }
    const data = await removeCustomTokens(body);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "add_manual_normalizations_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
