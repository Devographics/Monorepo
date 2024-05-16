import { cache } from "react";
import {
  fetchAllLocalesIds,
  fetchAllLocalesMetadata,
  fetchLocaleConverted,
} from "@devographics/fetch";
import { AppName } from "@devographics/types";
import { getCommonContexts, getLocaleIdFromParams } from "~/i18n/config";
import { getLocaleWithStrings } from "@devographics/i18n/server"

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 */
export const rscLocale = cache((options: any) => fetchLocaleConverted(options));
export const rscLocaleNew = cache(async (options: { localeId: string, contexts: Array<string> }) => {
  const { locale, error } = await getLocaleWithStrings(options)
  if (error) return { error }
  // react-i18n expects {foo1: bar1, foo2: bar2} etc. map whereas
  // api returns [{key: foo1, t: bar1}, {key: foo2, t: bar2}] etc. array
  const convertedStrings: { [key: string]: string } = {}
  locale.strings &&
    locale.strings.forEach(({ key, t, tHtml }) => {
      convertedStrings[key] = tHtml || t
    })
  const convertedLocale = { ...locale, strings: convertedStrings }
  // TODO: handle this more cleanly
  return { locale: convertedLocale }
}
)

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
  return { locale, localeId, error }
})

export const rscAllLocalesMetadata = cache((options?: any) =>
  fetchAllLocalesMetadata(options)
);
export const rscAllLocalesIds = cache(() =>
  fetchAllLocalesIds({ appName: AppName.SURVEYFORM })
);
