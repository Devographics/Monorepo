import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  fetchAllLocalesIds,
  fetchAllLocalesMetadata,
} from "@devographics/fetch";
import { AppName } from "@devographics/types";
import { getCommonContexts, safeLocaleIdFromParams } from "~/lib/i18n/config";
import { getLocaleDict } from "@devographics/i18n/server";
import { type LocaleParsed } from "@devographics/i18n";

/**
 * Will cache per localeId and contexts
 * /!\ Will not automatically merge cache if contexts are repeated
 * (eg fetching ["general"] then ["general", "survey"])
 */
export const rscLocale = cache(
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
      console.log("// rscLocale error");
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
 *
 * TODO: Next 16 will include a "use cache" directive that replaces "unstable_cache"
 * @see https://nextjs.org/blog/composable-caching
 */
export const rscLocaleFromParams = (params: LocaleParams) =>
  unstable_cache(
    async (params: LocaleParams) => {
      const contexts = params.contexts || getCommonContexts();
      const localeId = safeLocaleIdFromParams({ lang: params.lang });
      const { locale, error } = await rscLocale({
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
