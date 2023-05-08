/**
 * All functions within /app folder are expected to be appropriately cached
 */
import { notFound } from "next/navigation";
import { cache } from "react";
import { publicConfig } from "~/config/public";
import { fetchLocaleStrings, i18nCommonContexts } from "~/i18n/server/fetchLocalesRedis";

export const cachedFetchLocaleStrings = cache((localeId: string, ...contexts) => fetchLocaleStrings({ contexts, localeId }))

/** Used to compute metadata, use "mustFetchLocale" in pages */
export async function fetchLocaleFromUrl(params: { lang: string }, contexts: Array<string> = i18nCommonContexts) {
    // TODO: take the contexts or survey ID as a possible parameter to get the right set of strings
    const localeId = getLocaleId(params)
    if (!localeId) return null
    // locale fetching
    const localeWithStrings = await cachedFetchLocaleStrings(
        localeId,
        ...contexts,
    );
    if (!localeWithStrings) {
        console.error("Could not load locales of id: " + localeId);
        // TODO: ideally we would reset the user lang cookie
        return null
    }
    return { localeWithStrings, localeId }

}
function getLocaleId(params: { lang: string }): string | null {
    const locale = params.lang; // getCurrentLocale();
    if (locale.includes(".")) {
        if (publicConfig.isDev) {
            console.warn(
                `Error: matched a file instead of a lang: ${locale}. This happens when the file is not found.`
            )
        };
        return null
    }
    if (locale === "[lang]" || locale === "%5Blang%5D") {
        if (publicConfig.isDev) {
            console.warn(
                "Trying to render with param lang literally set to '[lang]'." +
                "This issue has appeared in Next 13.1.0+ (fev 2023)."
            )
        };
        return null
    }
    return locale
}

/**
 * Get locale, trigger notFound if not found
 * @param params 
 * @returns 
 */
export async function mustFetchLocale(params: { lang: string }) {
    const loc = await fetchLocaleFromUrl(params)
    // TODO: this will lead to a 404 if Redis haven't been properly filled with the right locales
    // we might want to redirect to a specific error page at the root of the app, that do not depend on a specific locale
    if (!loc) return notFound()
    return loc
}