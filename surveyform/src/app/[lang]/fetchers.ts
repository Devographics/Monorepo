/**
 * All functions within /app folder are expected to be appropriately cached
 */
import { notFound } from "next/navigation";
import { cache } from "react";
import { fetchLocaleStrings, i18nCommonContexts } from "~/i18n/server/fetchLocalesRedis";

export const cachedFetchLocaleStrings = cache(fetchLocaleStrings)

/** Used to compute metadata, use "mustFetchLocale" in pages */
export async function fetchLocaleFromUrl(params: { lang: string }) {
    const localeId = getLocaleId(params)
    if (!localeId) return null
    // locale fetching
    const localeWithStrings = await cachedFetchLocaleStrings({
        localeId,
        contexts: i18nCommonContexts,
    });
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
        console.warn(
            `Error: matched a file instead of a lang: ${locale}. This happens when the file is not found.`
        );
        return null
    }
    if (locale === "[lang]" || locale === "%5Blang%5D") {
        console.warn(
            "Trying to render with param lang literally set to '[lang]'." +
            "This issue has appeared in Next 13.1.0+ (fev 2023)."
        );
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
    if (!loc) return notFound()
    return loc
}
