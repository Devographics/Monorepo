import { Entity } from '@devographics/types'
import { allEntitiesCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { FetcherFunctionOptions } from '../types'
import { getEntitiesQuery } from '../queries'

export const fetchEntities = async (options?: FetcherFunctionOptions) => {
    const key = allEntitiesCacheKey(options)
    const getQuery = options?.getQuery || getEntitiesQuery
    const query = getQuery()
    return await getFromCache<Array<Entity>>({
        shouldGetFromCache: false,
        shouldUpdateCache: false,
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({ query, key })
            if (!result) throw new Error(`Couldn't fetch entities`)
            return result.entities as Entity[]
        },
        calledFrom: options?.calledFrom
    })
}
