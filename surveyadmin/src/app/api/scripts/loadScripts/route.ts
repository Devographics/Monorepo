import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getScripts } from "~/lib/scripts/actions";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const data = await getScripts();
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "load_scripts_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
