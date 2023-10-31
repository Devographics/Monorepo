import { NextRequest, NextResponse } from "next/server";
import { refreshSurveysCache, refreshLocalesCache, flushCache } from "@devographics/fetch";

/**
 * @see https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration
 * On PRO offer we are allowed for 300s execution max (default is 10s so too short for loading all locales)
 */
export const maxDuration = 300

/**
 * Empties Surveyform Redis cache
 * @param req 
 * @returns 
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const enOnly = req.nextUrl.searchParams.get("en-only")
  if (key !== process.env.SECRET_KEY) {
    return NextResponse.json({ error: "invalid_key" });
  } else {
    await refreshSurveysCache({ target: "production" });
    // Load en-US first so we get immediate results in dev
    await refreshLocalesCache({ target: "production", localeIds: ["en-US"] });
    if (!enOnly) {
      // Cleanup other locales (may take a few seconds)
      await refreshLocalesCache({ target: "production" }) //
    }
    // Also empty the in-memory cache for immediate results
    flushCache()
    return NextResponse.json({ data: { result: "ok" } });
  }
}
