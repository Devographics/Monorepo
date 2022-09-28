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
   * Internal API for translations and entities
   */
  translationAPI: process.env.TRANSLATION_API!,
  mongoUrl: process.env.MONGO_URI,
  // NOTE: each survey should try to use their own specific domain (see magic link auth)
  defaultMailFrom: process.env.MAIL_FROM || "login@devographics.com",
};
