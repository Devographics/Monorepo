import { Locale, } from '@devographics/types'
import { localeCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { getLocaleQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

/**
 * Fetch metadata and strings for a specific locale
 * 
 * @deprecated Use @devographics/i18n/server version
 */
export const fetchLocale = async (
    options: FetcherFunctionOptions & {
        localeId: string
        contexts: string[]
    }
) => {
    const { localeId } = options
    const getQuery = options.getQuery || getLocaleQuery
    const query = getQuery(options)
    const key = localeCacheKey(options)
    const result = await getFromCache<Locale>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({
                query,
                key
            })
            if (!result) throw new Error(`Couldn't fetch locale ${localeId}`)
            const locale = result.locale
            return locale
        },
        ...options
    })
    return result
}
