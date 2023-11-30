import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getQuestionData } from "~/lib/normalization/actions/getQuestionData";

export async function GET(req: NextRequest, res: NextResponse) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;
  const sectionId = req.nextUrl.searchParams.get("sectionId")!;
  const questionId = req.nextUrl.searchParams.get("questionId")!;
  try {
    const data = await getQuestionData({
      surveyId,
      editionId,
      sectionId,
      questionId,
      shouldGetFromCache: false,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "getQuestionData_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
