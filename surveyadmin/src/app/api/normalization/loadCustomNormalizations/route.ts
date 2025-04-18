import { NextRequest, NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";
import { getCustomTokens } from "~/lib/normalization/actions/getCustomTokens";
import { getSurveyEditionSectionQuestion } from "~/lib/normalization/helpers/getSurveyEditionQuestion";
import { getFormPaths } from "@devographics/templates";

// Avoid statically rendering route handlers
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const surveyId = req.nextUrl.searchParams.get("surveyId")!;
  const editionId = req.nextUrl.searchParams.get("editionId")!;
  const questionId = req.nextUrl.searchParams.get("questionId")!;

  try {
    // since this runs every few seconds,
    // always get from cache even if it's disabled otherwise
    const { edition, question } = await getSurveyEditionSectionQuestion({
      surveyId,
      editionId,
      questionId,
      shouldGetFromCache: true,
    });
    const paths = getFormPaths({ edition, question });
    const customNormalizations = await getCustomTokens({
      rawPath: paths.other!,
    });
    return NextResponse.json({ data: customNormalizations });
  } catch (error) {
    console.error(error);
    captureException(error);
    return NextResponse.json(
      {
        error: {
          id: "loadCustomNormalizations_error",
          status: 500,
          message: error.message,
          error,
        },
      },
      { status: 500 }
    );
  }
}
