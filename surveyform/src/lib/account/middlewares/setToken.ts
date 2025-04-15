import cloneDeep from "lodash/cloneDeep.js";
import { AUTH_TOKEN, MAX_AGE, encryptSession } from "~/lib/account/session";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserDocument } from "~/lib/users/typings";

/**
 * This function is expecting a Pages router API endpoint as we sill use Passport/Node.Js
 * NOTE: you cannot call this function multiple time otherwise Set-Cookie get overriden
 */
export function setTokenCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(AUTH_TOKEN, token, {
    maxAge: MAX_AGE,
    // expires: new Date(Date.now() + MAX_AGE),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  res.setHeader("Set-Cookie", cookie);
}
export const setToken = async (
  req: NextApiRequest & { user: UserDocument },
  res: NextApiResponse,
  next: any
) => {
  // session is the payload to save in the token, it may contain basic info about the user
  const session = cloneDeep(req.user);
  // The token is a string with the encrypted session
  const token = await encryptSession(session);
  setTokenCookie(res, token);
  return next();
};
