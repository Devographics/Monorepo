import { rscLocaleFromContext } from "~/lib/api/rsc-fetchers";

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
export async function ServerT({ token }: { token: string }) {
    const { locale, error } = await rscLocaleFromContext()
    if (error) return <span>Can't load locales</span>
    return <span>{locale.dict[token]?.t}</span>
}