/**
 * Parse process env and generate an object with relevant values
 *
 * TODO: add joi validation, add more values to avoid loading "process.env" everywhere in the app
 */

import { setAppName } from "@devographics/helpers";
import { publicConfig } from "./public";
import { AppName } from "@devographics/types";

export function serverConfig() {
  checkServerConfig();

  setAppName(AppName.SURVEYADMIN);
  return {
    // reexpose public variables for consistency
    ...publicConfig,
    /**
     * Auth
     */
    tokenSecret: process.env.TOKEN_SECRET,
    /**
     * Internal API for translations and entities
     */
    translationAPI: process.env.INTERNAL_API_URL!,
    mongoUri: process.env.MONGO_PRIVATE_URI,
    publicMongoUri: process.env.MONGO_PUBLIC_URI,
    redisUrl: process.env.REDIS_URL!,
    // Won't work with upstash, which accepts only HTTP
    // || "redis://localhost:6379",
    redisToken: process.env.REDIS_TOKEN || "",
    // NOTE: each survey should try to use their own specific domain (see magic link auth)
    defaultMailFrom: process.env.MAIL_FROM || "login@devographics.com",
    // to avoid risks of typos, reuse those values
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    // for non standard envs, NODE_ENV cannot always be overriden, so we need to check NEXT_PUBLIC_NODE_ENV
    isTest:
      process.env.NODE_ENV === "test" ||
      process.env.NEXT_PUBLIC_NODE_ENV === "test",
  };
}

/**
 * Wrapping into a function calls allow use to load env variable manually
 * in scripts that reuse this code outside of Next
 */
export function checkServerConfig() { }
