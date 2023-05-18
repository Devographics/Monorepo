// For the token
// https://hapi.dev/module/iron/
import Iron from "@hapi/iron";
import type { Request } from "express";
import type { NextApiRequest } from "next";
import { UserType } from "~/lib/users/model";
import { getTokenCookie } from "./auth-cookies";

// Use an environment variable here instead of a hardcoded value for production

export const getTokenSecret = () => {
  const TOKEN_SECRET = process.env.TOKEN_SECRET;
  if (!TOKEN_SECRET)
    throw new Error("Authentication not set for this application");
  return TOKEN_SECRET;
};

export function encryptSession(session: UserType) {
  const TOKEN_SECRET = getTokenSecret();
  return Iron.seal(session, TOKEN_SECRET, Iron.defaults);
}

/**
 * Returns the user data from the token
 * => it let's the backend check for user existence in the database
 * @param req
 * @deprecated Next.js already parses cookies for us
 */
export async function getSessionFromReq(
  req: NextApiRequest | Request
): Promise<UserType> {
  const token = getTokenCookie(req);
  return getSessionFromToken(token);
}

/**
 * @param token
 */
export async function getSessionFromToken(token: string) {
  const TOKEN_SECRET = getTokenSecret();
  return token && Iron.unseal(token, TOKEN_SECRET!, Iron.defaults);
}

export async function decryptToken(token: string) {
  const TOKEN_SECRET = getTokenSecret();
  return Iron.unseal(token, TOKEN_SECRET!, Iron.defaults);
}
