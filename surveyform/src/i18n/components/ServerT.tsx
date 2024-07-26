import { makeTranslationFunction, DATA_TOKEN_ATTR, DATA_MISSING_ATTR, DATA_FALLBACK_CHILDREN_ATTR } from "@devographics/i18n"
import { rscLocaleCached } from "~/lib/api/rsc-fetchers";

/**
 * Generate a function that can translate content for the current locale
 * Similar to "ServerT" but can be used in metadata function
 * 
 * Expect "setLocaleIdServerContext" to be called

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
 * KEEP IN SYNC with DynamicT/T from "@devographics/react-i18n" 
 */
export async function ServerT({ token, values, fallback, children }: {
    token: string, values?: Record<string, any>,
    /** 
     * Default fallback text
     * TODO: currently can only be a string but we should accept ReactNode?
     */
    fallback?: string,
    /** Can use children as a fallback */
    children?: React.ReactNode
}) {
    const { getMessage, error } = await rscTeapot()
    if (error) return <span>Can't load locales</span>
    const message = getMessage(token, values, fallback)
    const wrapperProps = { [DATA_TOKEN_ATTR]: token }
    // Render structured versions in priority
    if (message.tHtml) {
        return <span {...wrapperProps} dangerouslySetInnerHTML={{ __html: message.tHtml }} />
    }
    if (message.tClean) {
        return <span {...wrapperProps}>{message.tClean}</span>
    }
    if (message.missing) {
        // Try to use children value as fallback
        if (fallback && children) {
            console.warn(`Ambiguous fallback for token ${token}. Use either "fallback" props or React "children", but not both. Will use "fallback" prop.`)
            wrapperProps[DATA_MISSING_ATTR] = true
            return <span {...wrapperProps}> {message.t}</span >
        } else if (children) {
            wrapperProps[DATA_MISSING_ATTR] = true
            wrapperProps[DATA_FALLBACK_CHILDREN_ATTR] = true
            return <span {...wrapperProps}>{children}</span >
        } else {
            // "getMessage" already put "fallback" into "t" for us
            return <span {...wrapperProps}>{message.t}</span >
        }
    }
    return <span {...wrapperProps}>{message.t}</span>
}