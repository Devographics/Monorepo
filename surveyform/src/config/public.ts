/**
 * It has to be an env variable
 * because server side we can't access current domain via "window"
 *
 * @see https://vercel.com/docs/concepts/projects/environment-variables
 */
const appUrl =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_APP_URL ||
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
/**
 *
 * Values are defined in ".env.*", depending on the environment
 * You can set them as environment variables in production
 *
 * Only variables prefixed with NEXT_PUBLIC are available in the client app
 */
/**
 * TODO: load relevant NEXT_PUBLIC variable here
 * TODO: use Joi to validate the settings and throw appropriate issues (to be done in Vulcan Next)
 */
export const publicConfig = {
  defaultLocaleId: "en-US",
  locale: "en-US",
  /**
   * @deprecated
   */
  environment: "development",
  appUrl,
  repoUrl: "https://github.com/Devographics/Monorepo",
  isDev: process.env.NEXT_PUBLIC_NODE_ENV === "development",
  isTest: process.env.NEXT_PUBLIC_NODE_ENV === "test",
  assetUrl: process.env.NEXT_PUBLIC_ASSETS_URL
};
