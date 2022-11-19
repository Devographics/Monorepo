/**
 * Parse process env and generate an object with relevant values
 *
 * TODO: add joi validation, add more values to avoid loading "process.env" everywhere in the app
 */

import { publicConfig } from "./public";

export const serverConfig = {
  // reexpose public variables for consistency
  ...publicConfig,
  /**
   * Auth
   */
  tokenSecret: process.env.TOKEN_SECRET,
  /**
   * Internal API for translations and entities
   */
  translationAPI: process.env.TRANSLATION_API!,
  mongoUrl: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  // NOTE: each survey should try to use their own specific domain (see magic link auth)
  defaultMailFrom: process.env.MAIL_FROM || "login@devographics.com",
  // to avoid risks of typos, reuse those values
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};

const checkServerConfig = () => {
  if (serverConfig.isProd) {
    if (!process.env.REDIS_URL) {
      throw new Error(
        "process.env.REDIS_URL is mandatory in production.\n If building locally, set this value in .env.production.local or .env.test.local"
      );
    }
    if (!serverConfig.tokenSecret) {
      throw new Error("process.env.TOKEN_SECRET not set");
    }
  } else {
  }
};

checkServerConfig();
