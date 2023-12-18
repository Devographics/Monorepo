import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getNormalizationPercentages } from "~/lib/normalization/actions/getNormalizationPercentages";

// Avoid statically rendering route handlers
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, res: NextResponse) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;
  const forceRefresh = !!req.nextUrl.searchParams.get("forceRefresh")!;
  try {
    const data = await getNormalizationPercentages({
      surveyId,
      editionId,
      shouldGetFromCache: !forceRefresh,
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "load_normalization_percentages_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
