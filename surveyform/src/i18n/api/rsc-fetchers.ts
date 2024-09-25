import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  fetchAllLocalesIds,
  fetchAllLocalesMetadata,
} from "@devographics/fetch";
import { AppName } from "@devographics/types";
import { getCommonContexts, safeLocaleIdFromParams } from "~/i18n/config";
import { getLocaleDict } from "@devographics/i18n/server";
import { type LocaleParsed } from "@devographics/i18n";

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 */
export const rscLocaleNew = cache(
  async (options: {
    localeId: string;
    contexts: Array<string>;
  }): // FIXME: the type is not properly inferred at time of writing, despite being correct in the package
    Promise<
      | { locale: LocaleParsed; error?: undefined }
      | { error: Error; locale?: undefined }
    > => {
    const { locale, error } = (await getLocaleDict(options)) as
      | { locale: LocaleParsed; error?: undefined }
      | { locale?: undefined; error: Error };
    if (error) {
      console.log("// rscLocaleNew error");
      console.log(error);
      return { error };
    }
    // react-i18n expects {foo1: bar1, foo2: bar2} etc. map whereas
    // api returns [{key: foo1, t: bar1}, {key: foo2, t: bar2}] etc. array
    return { locale };
  }
);

interface LocaleParams {
  lang: string;
  contexts?: Array<string>;
}
/**
 * Get locale with strings, based on "lang" param
 *
 * To be used in pages and layouts
 * @see rscLocaleCached to get the locale from server components
 */
export const rscLocaleFromParams = (params: LocaleParams) =>
  unstable_cache(
    async (params: LocaleParams) => {
      const contexts = params.contexts || getCommonContexts();
      const localeId = safeLocaleIdFromParams({ lang: params.lang });
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
      if (error) {
        console.log("// rscLocaleFromParams error:");
        console.log(error);
        return { error };
      }
      return { locale, localeId };
    },
    // convoluted syntax that let's us compute cache key based on function params
    ["locale", ...(params.contexts || [])]
  )(params);

export const rscAllLocalesMetadata = cache((options?: any) =>
  fetchAllLocalesMetadata(options)
);
export const rscAllLocalesIds = cache(() =>
  fetchAllLocalesIds({ appName: AppName.SURVEYFORM })
);
