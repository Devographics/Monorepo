/**
 * Parse process env and generate an object with relevant values
 *
 * TODO: add joi validation, add more values to avoid loading "process.env" everywhere in the app
 */

import { publicConfig } from "./public";

const checkServerConfig = () => {
  if (process.env.NODE_ENV === "production" && !process.env.REDIS_URL) {
    throw new Error(
      "process.env.REDIS_URL is mandatory in production. If building locally, set this value in .env.production.local."
    );
  }
};
checkServerConfig();
export const serverConfig = {
  // reexpose public variables for consistency
  ...publicConfig,
  /**
   * Internal API for translations and entities
   */
  translationAPI: process.env.TRANSLATION_API!,
  mongoUrl: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  // NOTE: each survey should try to use their own specific domain (see magic link auth)
  defaultMailFrom: process.env.MAIL_FROM || "login@devographics.com",
};
