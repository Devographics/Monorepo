import { NextRequest, NextResponse } from "next/server";
import { AUTH_TOKEN } from "~/lib/account/session";

/**
 * Logout using a route handler
 * @param res
 */
function handlerRemoveTokenCookie(res: NextResponse) {
  res.cookies.delete(AUTH_TOKEN);
}

export async function POST(req: NextRequest) {
  const res = NextResponse.json({});
  handlerRemoveTokenCookie(res);
  return res;
}
