import { parse } from "cookie";
import type { NextApiRequest } from "next";
import type { Request } from "express";

/**
 * Get cookies from a request as a POJO
 * @param req
 * @returns
 */
export function parseCookies(req?: Request | NextApiRequest) {
  if (!req) {
    console.warn("Called parseCookies without a request");
    return {};
  }
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req.cookies;

  // For pages we do need to parse the cookies.
  const cookie = req.headers?.cookie;
  return parse(cookie || "");
}
