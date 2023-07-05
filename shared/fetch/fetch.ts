/**
 * 1) get from in-memory cache if available (short TTL because it can't be emptied)
 * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
 * 3) get from Github in last resort
 */
import NodeCache from 'node-cache'
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { logToFile } from '@devographics/helpers'

const memoryCache = new NodeCache({
    // This TTL must stay short, because we manually invalidate this cache
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false
})

/**
 * GraphQL objects have explicit "foo: null" fields, we can remove them to save space
 * @returns
 */
function removeNull(obj) {
    var clean = Object.fromEntries(
        Object.entries(obj)
            .map(([k, v]) => [k, v === Object(v) ? removeNull(v) : v])
            .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length))
    )
    return Array.isArray(obj) ? Object.values(clean) : clean
}

async function getFromRedisOrSource<T = any>({
    key,
    fetchFromSource,
    calledFromLog,
    shouldUpdateCache = true
}: {
    key: string
    fetchFromSource: () => Promise<T>
    calledFromLog: any
    shouldUpdateCache?: boolean
}) {
    const redisData = await fetchRedis<T>(key)
    if (redisData) {
        console.debug(`🔵 [${key}] in-memory cache miss, redis hit ${calledFromLog}`)
        return redisData
    }
    console.debug(`🟣 [${key}] in-memory & redis cache miss, fetching from API ${calledFromLog}`)
    const result = await fetchFromSource()
    if (shouldUpdateCache) {
        // store in Redis
        await storeRedis<T>(key, removeNull(result))
    }
    return result
}

/**
 * Generic function to fetch something from cache, or store it if cache misses
 * @returns
 */
export async function getFromCache<T = any>({
    key,
    fetchFunction: fetchFromSource,
    calledFrom,
    serverConfig,
    shouldGetFromCache: shouldGetFromCacheOptions,
    shouldUpdateCache = true
}: {
    key: string
    fetchFunction: () => Promise<T>
    calledFrom?: string
    serverConfig: Function
    shouldGetFromCache?: boolean
    shouldUpdateCache?: boolean
}) {
    initRedis(serverConfig().redisUrl, serverConfig().redisToken)
    const calledFromLog = calledFrom ? `(↪️  ${calledFrom})` : ''

    const shouldGetFromCacheEnv = !(process.env.ENABLE_CACHE === 'false')
    const shouldGetFromCache = shouldGetFromCacheOptions ?? shouldGetFromCacheEnv

    let resultPromise: Promise<T>
    // 1. we have the a promise that resolve to the data in memory => return that
    if (memoryCache.has(key)) {
        console.debug(`🟢 [${key}] in-memory cache hit ${calledFromLog}`)
        resultPromise = memoryCache.get<Promise<T>>(key)!
    } else {
        // 2. store a promise that will first look in Redis, then in the main db
        if (shouldGetFromCache) {
            resultPromise = getFromRedisOrSource({
                key,
                fetchFromSource,
                calledFromLog,
                shouldUpdateCache
            })
        } else {
            console.debug(`🟠 [${key}] Redis cache disabled, fetching from API ${calledFromLog}`)
            resultPromise = fetchFromSource()
            if (shouldUpdateCache) {
                const result = await fetchFromSource()
                // store in Redis
                await storeRedis<T>(key, removeNull(result))
            }
        }
        memoryCache.set(key, resultPromise)
    }
    try {
        const result = await resultPromise
        await logToFile(`${key}.json`, result, {
            mode: 'overwrite',
            subDir: 'fetch'
        })
        return result
    } catch (err) {
        console.error('// getFromCache error')
        console.error(err)
        console.debug(`🔴 [${key}] error when fetching from Redis or source ${calledFromLog}`)
        memoryCache.del(key)
        throw err
    }
}

export const getApiUrl = () => {
    const apiUrl = process.env.DATA_API_URL
    if (!apiUrl) {
        throw new Error('process.env.DATA_API_URL not defined, it should point the the API')
    }
    return apiUrl
}

function extractQueryName(queryString) {
    const regex = /query\s+(\w+)/
    const match = regex.exec(queryString)
    return match ? match[1] : null
}

/**
 * Returns null in case of error
 */
export const fetchGraphQLApi = async <T = any>({
    query,
    key: key_,
    apiUrl: apiUrl_,
    cache
}: {
    query: string
    key?: string
    apiUrl?: string
    /**
     * Override Next.js caching
     * "no-store" will prevent static rendering
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
     */
    cache?: RequestCache
}): Promise<T | null> => {
    const apiUrl = apiUrl_ || getApiUrl()
    const key = key_ || extractQueryName(query)
    await logToFile(`${key}.gql`, query, {
        mode: 'overwrite',
        subDir: 'graphql'
    })

    // console.debug(`// querying ${apiUrl} (${query.slice(0, 15)}...)`)
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ query, variables: {} }),
            cache: cache || undefined
        })
        const json: any = await response.json()
        if (json.errors) {
            console.error('// fetchGraphQLApi error 1')
            console.error(JSON.stringify(json.errors, null, 2))
            throw new Error(json.errors[0])
        }

        return json.data || {}
    } catch (error) {
        console.error('// fetchGraphQLApi error 2')
        console.error(error)
        throw new Error(error)
        // return null
    }
}
