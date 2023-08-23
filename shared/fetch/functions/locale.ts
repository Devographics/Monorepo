import { LocaleDefWithStrings } from '@devographics/types'
import { localeCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { getLocaleQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

/**
 * Fetch metadata and strings for a specific locale
 * @returns
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
    const result = await getFromCache<LocaleDefWithStrings>({
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
