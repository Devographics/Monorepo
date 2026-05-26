import cloneDeep from "lodash/cloneDeep.js";
import { AUTH_TOKEN, MAX_AGE, encryptSession } from "~/lib/account/session";
import { serialize } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";
import { UserDocument } from "~/lib/users/typings";
import {
  AuthenticatedNextApiRequest,
  SimplifiedUserDocument,
} from "../magicLogin/typings/requests-body";

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
  req: AuthenticatedNextApiRequest,
  res: NextApiResponse,
  next: any,
) => {
  const session = cloneDeep(req.user) as UserDocument;

  const token = await encryptSession(session);

  setTokenCookie(res, token);

  return next();
};
