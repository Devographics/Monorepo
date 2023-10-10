import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getNormalizationPercentages } from "~/lib/normalization/actions/getNormalizationPercentages";

export async function GET(req: NextRequest, res: NextResponse) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;

  try {
    const data = await getNormalizationPercentages({ surveyId, editionId });
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
