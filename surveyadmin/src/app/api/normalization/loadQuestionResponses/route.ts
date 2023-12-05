import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getScripts } from "~/lib/scripts/actions";
import { getQuestionResponses } from "~/lib/normalization/actions/getQuestionResponses";

export async function GET(req: NextRequest, res: NextResponse) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;
  const questionId = req.nextUrl.searchParams.get("questionId")!;

  try {
    const data = await getQuestionResponses({
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
          id: "getQuestionResponses_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
