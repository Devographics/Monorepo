/**
 * We need a .js file until next.config.ts is supported,
 * as we use this list to configure locale redirections
 */
export const localesDefs = [
  {
    id: "ca-ES",
    label: "Català",
  },
  {
    id: "cs-CZ",
    label: "Česky",
  },
  {
    id: "de-DE",
    label: "Deutsch",
  },
  {
    id: "en-US",
    label: "English",
  },
  {
    id: "es-ES",
    label: "Español",
  },
  {
    id: "fa-IR",
    label: "فارسی",
    rtl: true,
  },
  {
    id: "fr-FR",
    label: "Français",
  },
  { id: "gl-ES", label: "Galego" },
  {
    id: "hi-IN",
    label: "Hindi",
  },
  {
    id: "it-IT",
    label: "Italiano",
  },
  {
    id: "pt-PT",
    label: "Português",
  },
  {
    id: "pt-BR",
    label: "Português (Brasil)",
  },
  {
    id: "ru-RU",
    label: "Русский",
  },
  {
    id: "ua-UA",
    label: "Українська",
  },
  {
    id: "sv-SE",
    label: "Svenska",
  },
  {
    id: "tr-TR",
    label: "Türkçe",
  },
  {
    id: "id-ID",
    label: "Indonesia",
  },
  {
    id: "zh-Hans",
    label: "简体中文",
  },
  {
    id: "zh-Hant",
    label: "正體中文",
  },

  {
    id: "ja-JP",
    label: "日本語",
  },
  {
    id: "pl-PL",
    label: "Polski",
  },
  {
    id: "ko-KR",
    label: "한국어",
  },
  {
    id: "nl-NL",
    label: "Nederlands",
  },
  {
    id: "ro-RO",
    label: "Română",
  },
  {
    id: "hu-HU",
    label: "Magyar",
  },
];

export const localesDefsMap = localesDefs.reduce((lm, localeDef) => ({
  ...lm,
  [localeDef.id]: localeDef,
}));

const localeIds = localesDefs.map((l) => l.id);
/**
 * Might contain duplicates, not safe to use
 */
const countryIdsWithDups = localeIds.map((l) => l.slice(0, 2));

/**
 * We list both the country locale and the full locale with region as valid
 * Beware of duplicates
 */
const uniqueLocales = [
  ...new Set([...localeIds, ...countryIdsWithDups]).values(),
];

export const locales = uniqueLocales;

export const defaultLocale = "en-US";

/**
 * Return a locale that exists in our locales definitions
 * If passed a country, will use the first matching locale for this country
 * Return default locale (en-US) otherwise
 * @param localeId
 * @returns
 */
export const getClosestLocale = (localeId?: string) => {
  if (!localeId) return defaultLocale;
  if (uniqueLocales.includes(localeId)) return localeId;
  const isCountry = localeId.length === 2;
  if (isCountry) {
    const firstMatchingLocale = uniqueLocales.find((l) => {
      return l.slice(0, 2) === localeId;
    });
    if (firstMatchingLocale) return firstMatchingLocale;
  } else {
    return defaultLocale;
  }
  return defaultLocale;
};
