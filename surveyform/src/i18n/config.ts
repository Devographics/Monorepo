import {
  EnvVar,
  parseEnvVariableArray,
  getEnvVar,
} from "@devographics/helpers";
import { EditionMetadata, SurveyMetadata } from "@devographics/types";
import { publicConfig } from "~/config/public";

export const defaultLocaleId = "en-US";

const baseContexts = ["common", "surveys", "accounts"];

// i18n contexts common to all surveys and editions
export const getCommonContexts = () => {
  const customContexts = parseEnvVariableArray(
    getEnvVar(EnvVar.CUSTOM_LOCALE_CONTEXTS)
  );
  return [...baseContexts, ...customContexts];
};

/**
 * i18n contexts for a survey
 * Will NOT load common contexts,
 * you are expected to use I18nContext multiple time
 * - one for /[lang]
 * - one for /[lang]/[survey]
 * etc., the context will automatically merge contexts
 * this prevents loading the same locales again when navigating
 */
export const getSurveyContexts = (survey: SurveyMetadata) => [
  //...getCommonContexts(),
  survey.id,
];

/**
 * 
 * i18n contexts for an edition of a survey
 * will NOT load common contexts and generic survey context
 * the parent layout should take care of that
 * @param edition 
 * @returns 
 */
export const getEditionContexts = (edition: EditionMetadata) => [
  //...getSurveyContexts(edition.survey),
  edition.id,
];

export const safeLocaleIdFromParams = (params: { lang: string }) => {
  const localeId = filterLang(params.lang);
  if (!localeId) {
    throw new Error(
      `Could not figure out locale from params: ${JSON.stringify(params)}`
    );
  }
  return localeId;
};

/**
 * The "lang" param can be either:
 * - an existing locale (this is guaranteed by the root middleware)
 * - a file path or litterally the param name (due to a bug)
 * This utility returns null if the param is not a valid locale, or the param if it's valid
 */
function filterLang(maybeLocale: string): string | null {
  if (maybeLocale.includes(".")) {
    if (publicConfig.isDev) {
      console.warn(
        `Error: matched a file instead of a lang: ${maybeLocale}. This happens when the file is not found.`
      );
    }
    return null;
  }
  if (maybeLocale === "[lang]" || maybeLocale === "%5Blang%5D") {
    if (publicConfig.isDev) {
      console.warn(
        "Trying to render with param lang literally set to '[lang]'." +
        "This issue has appeared in Next 13.1.0+ (fev 2023)."
      );
    }
    return null;
  }
  return maybeLocale;
}
