import { cache } from "react";
import {
  fetchAllLocalesIds,
  fetchAllLocalesMetadata,
  fetchLocaleConverted,
} from "@devographics/fetch";
import { AppName } from "@devographics/types";
import { getCommonContexts, getLocaleIdFromParams } from "~/i18n/config";
import { getLocaleDict } from "@devographics/i18n/server"
import { type LocaleParsed } from "@devographics/i18n";
import { rscLocaleIdContext } from "~/i18n/rsc-context";

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 * @deprecated replace by the new version
 */
export const rscLocale = cache((options: any) => fetchLocaleConverted(options));
export const rscLocaleNew = cache(async (options: { localeId: string, contexts: Array<string> }):
  // FIXME: the type is not properly inferred at time of writing, despite being correct in the package
  Promise<{ locale: LocaleParsed, error?: undefined } | { error: Error, locale?: undefined }> => {
  const { locale, error } = await getLocaleDict(options) as { locale: LocaleParsed, error?: undefined } | { locale?: undefined, error: Error }
  if (error) return { error }
  // react-i18n expects {foo1: bar1, foo2: bar2} etc. map whereas
  // api returns [{key: foo1, t: bar1}, {key: foo2, t: bar2}] etc. array
  return { locale }
}
)

/**
 * Get locale with strings, based on "lang" param
 * 
 * To be used in pages and layouts
 * @see rscLocaleFromContext to get the locale from server components
 */
export const rscLocaleFromParams = cache(async (params: { lang: string }) => {
  const contexts = getCommonContexts();
  const localeId = getLocaleIdFromParams(params);
  // TODO: our previous implemention returns "data", "error", common in graphql
  // while the pipeline system insteads return the data or throw
  /*const {
    data: locale,
    error,
    ___metadata: ___rscLocale_CommonContexts,
  }*/ const { locale, error } = await rscLocaleNew({
    localeId,
    contexts,
  });
  if (error) return { error }
  return { locale, localeId }
})

/**
 * Get current locale strings within React Server Components
 * Uses a server context to retrieve the "lang" param
 */
export const rscLocaleFromContext = cache(async () => {
  const localeId = rscLocaleIdContext()
  return rscLocaleFromParams({ lang: localeId })
})

export const rscAllLocalesMetadata = cache((options?: any) =>
  fetchAllLocalesMetadata(options)
);
export const rscAllLocalesIds = cache(() =>
  fetchAllLocalesIds({ appName: AppName.SURVEYFORM })
);
