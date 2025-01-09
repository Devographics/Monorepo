import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getQuestionData } from "~/lib/normalization/actions/getQuestionData";

// Avoid statically rendering route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;
  const sectionId = req.nextUrl.searchParams.get("sectionId")!;
  const questionId = req.nextUrl.searchParams.get("questionId")!;
  const shouldGetFromCache =
    req.nextUrl.searchParams.get("shouldGetFromCache")! === "true";
  try {
    const { data, query } = await getQuestionData({
      surveyId,
      editionId,
      sectionId,
      questionId,
      shouldGetFromCache,
    });
    return NextResponse.json({ data, query });
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
