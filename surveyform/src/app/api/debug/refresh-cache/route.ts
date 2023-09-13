import { NextRequest, NextResponse } from "next/server";
import { refreshSurveysCache, refreshLocalesCache } from "@devographics/fetch";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.SECRET_KEY) {
    return NextResponse.json({ error: "invalid_key" });
  } else {
    await refreshSurveysCache({ target: "production" });
    await refreshLocalesCache({ target: "production", localeIds: ["en-US"] });
    return NextResponse.json({ data: { result: "ok" } });
  }
}
