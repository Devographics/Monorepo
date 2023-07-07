import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getScripts } from "~/lib/scripts/actions";
import { getUnnormalizedFields } from "~/lib/normalization/actions/getUnnormalizedFields";

export async function GET(req: NextRequest, res: NextResponse) {
  const surveyId = req.nextUrl.searchParams.get("surveyId");
  const editionId = req.nextUrl.searchParams.get("editionId");
  const questionId = req.nextUrl.searchParams.get("questionId");
  try {
    const data = await getUnnormalizedFields({
      surveyId,
      editionId,
      questionId,
    });
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
