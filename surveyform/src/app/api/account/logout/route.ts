import { NextRequest, NextResponse } from "next/server";
import { removeTokenCookie } from "~/account/user/api";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({})
  removeTokenCookie(res);
  return res
}
