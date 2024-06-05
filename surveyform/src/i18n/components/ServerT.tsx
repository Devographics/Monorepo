import { makeTranslationFunction, DATA_TOKEN_ATTR } from "@devographics/i18n"
import { rscLocaleCached } from "~/lib/api/rsc-fetchers";

/**
 * Generate a function that can translate content for the current locale
 * @param param0 
 * @returns 
 */
export async function rscTeapot({ contexts }: { contexts?: Array<string> } = {}) {
    const { locale, error } = await rscLocaleCached({ contexts })
    if (error) return { error }
    const { t, getMessage } = makeTranslationFunction(locale)
    return { t, getMessage }
}

/**
 * A formatted message,
 * using a server component without hydration
 * 
 * It retrieves the current locale strings in the "server context"
 * setLocaleServerContext(localeId) must be called by the parent page
 * before this component is rendered
 * 
 * See Astro equivalent in the results-astro app
 * 
 * TODO: this is just a draft to check that everything is plugged
 * we should handle edge cases : children fallback, adding data attributes etc.
 */
export async function ServerT({ token, values, fallback }: { token: string, values?: Record<string, any>, fallback?: string }) {
    const { t, error } = await rscTeapot()
    if (error) return <span>Can't load locales</span>
    return <span {...{ [DATA_TOKEN_ATTR]: token }}>{t(token, values, fallback)}</span>
}