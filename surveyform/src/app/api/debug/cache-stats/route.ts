import { NextRequest, NextResponse } from "next/server";
import { getCacheStats } from "@devographics/fetch";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== process.env.SECRET_KEY) {
    return NextResponse.json({ error: "invalid_key" });
  } else {
    const data = getCacheStats();
    return NextResponse.json({ data });
  }
}
