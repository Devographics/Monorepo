import { serialize } from "cookie";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export const TOKEN_NAME = "token";
// in milliseconds
const MAX_AGE = 1000 * 60 * 60 * 24 * 90; // 3 months

/**
 * NOTE: you cannot call this function multiple time otherwise Set-Cookie get overriden
 * TODO: find a way to set more than one cookie
 * @param res
 * @param token
 */
export function setTokenCookie(res, token) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    // expires: new Date(Date.now() + MAX_AGE),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  res.setHeader("Set-Cookie", cookie);
}

export function rhRemoveTokenCookie(res: NextResponse) {
  res.cookies.delete(TOKEN_NAME)
}


export function apiGetTokenCookie(req: NextApiRequest) {
  return req.cookies[TOKEN_NAME];
}
