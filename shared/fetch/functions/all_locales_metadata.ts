import { LocaleDef } from '@devographics/types'

import { getFromCache, fetchGraphQLApi } from '../fetch'
import { allLocalesMetadataCacheKey, allLocalesIdsCacheKey } from '../cache_keys'
import { getAllLocalesMetadataQuery, getAllLocalesIdsQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

/**
 * Fetch metadata for all locales
 * @returns
 */
export const fetchAllLocalesMetadata = async (options?: FetcherFunctionOptions) => {
    const getQuery = options?.getQuery || getAllLocalesMetadataQuery
    const query = getQuery()
    const key = allLocalesMetadataCacheKey(options)
    const result = await getFromCache<Array<LocaleDef>>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({
                query,
                key,
                cache: "force-cache"
            })
            return result.locales
        },
        ...options
    })
    return result
}

/**
 * Fetch list of all available locale ids
 * Used for routing the user to the right locale
 * Safe for parallel calls (eg in Next.js middlewares)
 * @returns
 */
export const fetchAllLocalesIds = async (options?: FetcherFunctionOptions) => {
    const getQuery = options?.getQuery || getAllLocalesIdsQuery
    const query = getQuery()
    const key = allLocalesIdsCacheKey(options)
    return await getFromCache<Array<string>>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi<{ locales: Array<LocaleDef> }>({
                query,
                key,
                cache: "default"
            })
            return result?.locales.map(l => l.id) || []
        }
    })
}
