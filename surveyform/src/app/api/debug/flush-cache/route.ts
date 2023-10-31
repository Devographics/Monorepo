import { NextRequest, NextResponse } from "next/server";
import { flushCache } from "@devographics/fetch";

/**
 * Empties the short-lived in-memory cache
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.SECRET_KEY) {
    return NextResponse.json({ error: "invalid_key" });
  } else {
    flushCache();
    return NextResponse.json({ data: { result: "ok" } });
  }
}
