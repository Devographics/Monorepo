/**
 * 1) get from in-memory cache if available (short TTL because it can't be emptied)
 * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
 * 3) get from Github in last resort
 */
import NodeCache from 'node-cache'
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { logToFile } from '@devographics/debug'

export const memoryCache = new NodeCache({
    // This TTL must stay short, because we manually invalidate this cache
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false
})

export const getCacheStats = () => {
    return memoryCache.getStats()
}

export const flushCache = () => {
    memoryCache.flushAll()
}

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

export enum SourceType {
    REDIS = 'redis',
    MEMORY = 'memory',
    API = 'api'
}
interface Metadata {
    key: string
    timestamp: string
    source: SourceType
}

export enum FetchPayloadResultType {
    ERROR = 'error',
    SUCCESS = 'success'
}

/* 

TODO: figure out why type inference didn't work and then replace
"FetchPayloadSuccessOrError" with "FetchPayloadSuccess" or "FetchPayloadError"

*/
// export interface FetchPayload<Type extends FetchPayloadResultType> {
//     type: Type
//     ___metadata: Metadata
// }

// export interface FetchPayloadError extends FetchPayload<FetchPayloadResultType.ERROR> {
//     error: any
// }

// export interface FetchPayloadSuccess<T> extends FetchPayload<FetchPayloadResultType.SUCCESS> {
//     data: T
// }

export interface FetchPayloadSuccessOrError<T> {
    ___metadata: Metadata
    data: T
    error?: any
}

export function processFetchData<T>(data, source, key): FetchPayloadSuccessOrError<T> {
    const timestamp = new Date().toISOString()
    const ___metadata: Metadata = { key, source, timestamp }
    const result = { data, ___metadata }
    return removeNull(result)
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
    const redisData = await fetchRedis<FetchPayloadSuccessOrError<T>>(key)
    if (redisData) {
        console.debug(`🔵 [${key}] in-memory cache miss, redis hit ${calledFromLog}`)
        return redisData
    }
    console.debug(`🟣 [${key}] in-memory & redis cache miss, fetching from API ${calledFromLog}`)
    const result = await fetchFromSource()
    const processedResult = processFetchData<T>(result, SourceType.API, key)
    if (shouldUpdateCache) {
        processedResult.___metadata.source = SourceType.REDIS
        // store in Redis
        await storeRedis<FetchPayloadSuccessOrError<T>>(key, processedResult)
    }
    return processedResult
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
    shouldUpdateCache = true,
    shouldThrow = true
}: {
    key: string
    fetchFunction: () => Promise<T>
    calledFrom?: string
    serverConfig: Function
    shouldGetFromCache?: boolean
    shouldUpdateCache?: boolean
    shouldThrow?: boolean
}) {
    initRedis(serverConfig().redisUrl, serverConfig().redisToken)
    const calledFromLog = calledFrom ? `(↪️  ${calledFrom})` : ''

    const shouldGetFromCacheEnv = !(process.env.ENABLE_CACHE === 'false')
    const shouldGetFromCache = shouldGetFromCacheOptions ?? shouldGetFromCacheEnv

    async function fetchAndProcess<T>(source) {
        const data = await fetchFromSource()
        return processFetchData<T>(data, source, key)
    }

    let resultPromise: Promise<FetchPayloadSuccessOrError<T>>
    // 1. we have the a promise that resolve to the data in memory => return that
    if (memoryCache.has(key)) {
        console.debug(`🟢 [${key}] in-memory cache hit ${calledFromLog}`)
        resultPromise = memoryCache.get<Promise<FetchPayloadSuccessOrError<T>>>(key)!
    } else {
        // 2. store a promise that will first look in Redis, then in the main db
        if (shouldGetFromCache) {
            resultPromise = getFromRedisOrSource<T>({
                key,
                fetchFromSource,
                calledFromLog,
                shouldUpdateCache
            })
        } else {
            console.debug(`🟠 [${key}] Redis cache disabled, fetching from API ${calledFromLog}`)
            resultPromise = fetchAndProcess<T>(SourceType.API)
            if (shouldUpdateCache) {
                const result = await resultPromise
                result.___metadata.source = SourceType.REDIS
                // store in Redis
                await storeRedis<FetchPayloadSuccessOrError<T>>(key, result)
            }
        }
        memoryCache.set(key, resultPromise)
    }
    try {
        let result = await resultPromise
        await logToFile(`${key}.json`, result, {
            mode: 'overwrite',
            subDir: 'fetch'
        })
        return result
    } catch (error) {
        console.error('// getFromCache error')
        console.error(error)
        console.debug(`🔴 [${key}] error when fetching from Redis or source ${calledFromLog}`)
        memoryCache.del(key)
        if (shouldThrow) {
            throw error
        } else {
            const result = { error: error.message } as FetchPayloadSuccessOrError<T>
            return result
        }
    }
}

export const getApiUrl = () => {
    const apiUrl = process.env.API_URL
    if (!apiUrl) {
        throw new Error('process.env.API_URL not defined, it should point the the API')
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
    /** Unique query identifier, will use the query name as a default */
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
        console.error(`// fetchGraphQLApi error 1 (${apiUrl})`)
        console.error(JSON.stringify(json.errors, null, 2))
        throw new Error(json.errors[0].message)
    }

    return json.data || {}
}
