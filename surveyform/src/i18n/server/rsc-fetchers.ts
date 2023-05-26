/**
 * All functions within /app folder are expected to be appropriately cached
 */
import { notFound } from "next/navigation";
import { cache } from "react";
import { publicConfig } from "~/config/public";
import { fetchLocale, FetchLocaleOptions } from "~/lib/api/fetch";
import { getCommonContexts } from "~/i18n/config";

export const cachedFetchLocale = cache((options: FetchLocaleOptions) =>
  fetchLocale(options)
);

/**
 * Will add default contexts if nor is passed
 */
export const cachedFetchLocaleFromUrl = cache(
  async ({
    langParam,
    contexts,
  }: {
    langParam: string;
    contexts?: Array<string>;
  }) => {
    // TODO: take the contexts or survey ID as a possible parameter to get the right set of strings
    const localeId = filterLang(langParam);
    if (!localeId) return null;
    // locale fetching
    const localeWithStrings = await cachedFetchLocale({
      localeId,
      contexts: contexts || getCommonContexts(),
    });
    if (!localeWithStrings) {
      console.error("Could not load locales of id: " + localeId);
      // TODO: ideally we would reset the user lang cookie
      return null;
    }
    return { localeWithStrings, localeId };
  }
);

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

/**
 * Get locale, trigger notFound if not found
 * @param params
 * @returns
 */
export async function mustFetchLocale(params: { lang: string }) {
  const loc = await cachedFetchLocaleFromUrl({ langParam: params.lang });
  // TODO: this will lead to a 404 if Redis haven't been properly filled with the right locales
  // we might want to redirect to a specific error page at the root of the app, that do not depend on a specific locale
  if (!loc) notFound();
  return loc;
}
