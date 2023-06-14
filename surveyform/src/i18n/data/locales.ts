import { fetchAllLocalesMetadata } from "~/lib/api/fetch";

export const defaultLocaleId = "en-US";

/**
 * Return a locale that exists in our locales definitions
 * If passed a country, will use the first matching locale for this country
 * Return default locale (en-US) otherwise or a close locale if possible
 * @param localeId
 * @returns
 */
export const getClosestLocale = async (localeId?: string) => {
  if (!localeId) return defaultLocaleId;
  const allLocalesMetadata = await fetchAllLocalesMetadata();
  const localeIds = allLocalesMetadata.map((l) => l.id);
  if (localeIds.includes(localeId)) return localeId;
  const isCountry = localeId.length === 2;
  if (isCountry) {
    const firstMatchingLocale = localeIds.find((l) => {
      return l.slice(0, 2) === localeId;
    });
    if (firstMatchingLocale) return firstMatchingLocale;
    return defaultLocaleId;
  }
  // country codes where finding the closest locale is fine
  const countryCode = localeId.slice(0, 2);
  if (["fr", "pt"].includes(countryCode)) {
    const firstMatchingLocale = localeIds.find((l) => {
      return l.slice(0, 2) === localeId.slice(0, 2);
    });
    if (firstMatchingLocale) return firstMatchingLocale;
    return defaultLocaleId;
  }
  // use zh-Hans as the default for China
  // TODO: might not always be the most appropriate?
  if (countryCode === "zh") {
    const zhHans = localeIds.find((l) => l === "zh-Hans");
    if (!zhHans) {
      console.warn("zh-Hans not found in locales list, fallback to en-US");
      return defaultLocaleId;
    }
    return zhHans;
  }
  // else use English (for unsupported countries/if en-US is safer for this country)
  return defaultLocaleId;
};
