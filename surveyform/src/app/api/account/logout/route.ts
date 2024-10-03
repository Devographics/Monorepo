import { NextRequest, NextResponse } from "next/server";
import { handlerRemoveTokenCookie } from "~/lib/account/session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({})
  handlerRemoveTokenCookie(res);
  return res
}
