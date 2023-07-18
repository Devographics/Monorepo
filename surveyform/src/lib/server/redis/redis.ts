import { initRedis } from "@devographics/redis";
import { NextApiRequest, NextApiResponse } from "next";
import { serverConfig } from "~/config/server";

/**
 * Create a Redis connection needed for shared code
 * TODO: we might want a dedicated @devographics/redis package
 */
export function connectToRedis() {
  initRedis();
}

/**
 * Middleware version for legacy next-connect
 */
export const connectToRedisMiddleware = (
  req: NextApiRequest,
  res: NextApiResponse,
  next
) => {
  connectToRedis();
  return next();
};
