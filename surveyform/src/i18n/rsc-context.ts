/**
 * Server context usable to avoid props drilling
 * Mostly useful for caching page parameters
 * 
 * For data fetched from API or databases,
 * use React "cache" directly instead of this
 */
import serverContext from "server-only-context";

/**
 * Note: when navigating on the client side the layout is not re-rendered, so you need to set the context both in the page and in the layout.
 */
const [getLocale, setLocale] = serverContext<string | null>(null);

export const rscLocaleIdContext = () => {
    const locale = getLocale()
    if (!locale) throw new Error("Calling getLocale from server-context before it is set. Remember to set the locale from the current page params.")
    return locale
}
export const setLocaleIdServerContext = setLocale
