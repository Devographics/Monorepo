import { setAppName, getConfig, EnvVar } from "@devographics/helpers";

/**
 * Parse process env and generate an object with relevant values
 *
 * TODO: add joi validation, add more values to avoid loading "process.env" everywhere in the app
 */

import { publicConfig } from "./public";
import { AppName } from "@devographics/types";

// Experimental system with getConfig
setAppName(AppName.SURVEYFORM);
export const envConfig = (id: EnvVar) => getConfig()[id];

export function serverConfig() {
  checkServerConfig();

  setAppName(AppName.SURVEYFORM);
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
    translationAPI: process.env.API_URL!,
    mongoUri: process.env.MONGO_PUBLIC_URI!,
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

    /**
     * This is host specific
     * @see https://vercel.com/docs/projects/environment-variables/system-environment-variables
     * @see https://render.com/docs/environment-variables
     */
    deploymentCommit:
      process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT,
  };
}

/**
 * Wrapping into a function calls allow use to load env variable manually
 * in scripts that reuse this code outside of Next
 */
export function checkServerConfig() {
  let errors: Array<string> = [];

  if (process.env.NODE_ENV === "production") {
    // prod only check
  } else {
    // dev only check
  }
  if (errors.length) {
    console.error("// checkServerConfig");
    throw new Error(errors.join("\n "));
  }
}
