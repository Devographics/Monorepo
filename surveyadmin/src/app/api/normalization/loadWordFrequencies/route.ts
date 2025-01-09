import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getWordFrequencies } from "~/lib/normalization/actions/getWordFrequencies";

// Avoid statically rendering route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;
  const sectionId = req.nextUrl.searchParams.get("sectionId")!;
  const questionId = req.nextUrl.searchParams.get("questionId")!;
  try {
    const { data } = await getWordFrequencies({
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
          id: "getWordFrequencies_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
