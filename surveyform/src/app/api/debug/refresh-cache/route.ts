import { NextRequest, NextResponse } from "next/server";
import { refreshSurveysCache, refreshLocalesCache } from "@devographics/fetch";

/**
 * Empties Surveyform Redis cache
 * @param req 
 * @returns 
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.SECRET_KEY) {
    return NextResponse.json({ error: "invalid_key" });
  } else {
    await refreshSurveysCache({ target: "production" });
    await refreshLocalesCache({ target: "production" })/* It's better to cleanup everything , localeIds: ["en-US"] })*/;
    return NextResponse.json({ data: { result: "ok" } });
  }
}
