import { GraphQLResolveInfo } from "graphql";
import { getLocales, getLocaleStrings } from "./fetchLocalesRedis";

/*

Locales

*/

// all locales

export const surveyLocaleType = `type SurveyLocale {
  id: String,
  label: String
  dynamic: Boolean
  strings: JSON
  translators: [String]
  completion: Float
  repo: String
  translatedCount: Float
  totalCount: Float
}`;
/**
 *
 * @returns List of all possible locales WITHOUT strings
 */
export const localesResolver = async (
  root,
  args,
  context,
  info: GraphQLResolveInfo
) => {
  const locales = await getLocales();
  return locales;
};

export const localesQueryTypeDef = "locales: [SurveyLocale]";

/**
 *
 * THIS OVERRIDES VULCAN DEFAULT "locale" RESOLVER! Vulcan version won't load strings dynamically
 * This is a custom resolver from State of js, that fetches locales dynamically
 *
 * @param root
 * @param param1
 * @param context
 * @returns
 */
export const localeResolver = async (root, { localeId }, context) => {
  return await getLocaleStrings(localeId);
};
