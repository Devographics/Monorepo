import { initRedis } from "@devographics/core-models/server";
import { captureMessage, init } from "@sentry/node";
import Redis from "ioredis";
import { serverConfig } from "~/config/server";

/**
 * Create a Redis connection needed for shared code
 * TODO: we might want a dedicated @devographics/redis package
 */
export function connectToRedis() {
  initRedis(serverConfig.redisUrl)
}

/**
 * Middleware version for legacy next-connect
 */
export const connectToRedisMiddleware = (req, res, next) => {
  connectToRedis()
  return next();
};

