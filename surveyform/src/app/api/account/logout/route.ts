import { NextRequest, NextResponse } from "next/server";
import { handlerRemoveTokenCookie } from "~/account/user/api";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({})
  handlerRemoveTokenCookie(res);
  return res
}
