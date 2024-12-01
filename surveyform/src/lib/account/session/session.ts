// For the token
// https://hapi.dev/module/iron/
import Iron from "@hapi/iron";
import type { NextApiRequest } from "next";
import { UserDocument } from "~/lib/users/typings";
import { AUTH_TOKEN } from ".";

function apiGetTokenCookie(req: NextApiRequest) {
  return req.cookies[AUTH_TOKEN];
}

// Use an environment variable here instead of a hardcoded value for production

export const getTokenSecret = () => {
  const TOKEN_SECRET = process.env.TOKEN_SECRET;
  if (!TOKEN_SECRET)
    throw new Error("Authentication not set for this application");
  return TOKEN_SECRET;
};

export function encryptSession(session: UserDocument) {
  const TOKEN_SECRET = getTokenSecret();
  return Iron.seal(session, TOKEN_SECRET, Iron.defaults);
}

export async function apiGetSessionFromReq(
  req: NextApiRequest
): Promise<UserDocument> {
  const token = apiGetTokenCookie(req);
  return getSessionFromToken(token);
}

/**
 * @param token
 */
export async function getSessionFromToken(token?: string) {
  const TOKEN_SECRET = getTokenSecret();
  return token && Iron.unseal(token, TOKEN_SECRET!, Iron.defaults);
}

export async function decryptToken(token: string) {
  const TOKEN_SECRET = getTokenSecret();
  return Iron.unseal(token, TOKEN_SECRET!, Iron.defaults);
}
