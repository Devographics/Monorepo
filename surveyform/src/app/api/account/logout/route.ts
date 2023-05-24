import { NextRequest, NextResponse } from "next/server";
import { rhRemoveTokenCookie } from "~/account/user/api";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({})
  rhRemoveTokenCookie(res);
  return res
}
