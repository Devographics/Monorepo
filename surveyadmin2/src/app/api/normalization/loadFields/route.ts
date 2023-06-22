import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getScripts } from "~/lib/scripts/actions";
import { getUnnormalizedFields } from "~/lib/normalization/actions";

export async function POST(req: NextRequest, res: NextResponse) {
  let args = await req.json();
  const { editionId, questionId } = args;
  try {
    const data = await getUnnormalizedFields({ editionId, questionId });
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
