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
};
