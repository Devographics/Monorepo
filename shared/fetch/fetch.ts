/**
 * 1) get from in-memory cache if available (short TTL because it can't be emptied)
 * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
 * 3) get from Github in last resort
 */
import NodeCache from 'node-cache'
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { logToFile } from '@devographics/debug'
import { CacheType, GetFromCacheOptions, SourceType } from './types'
import { FetchPipelineStep, runFetchPipeline } from './pipeline'
import { EnvVar, getEnvVar } from "@devographics/helpers"
// import { compressJSON, decompressJSON } from './compress'

export const memoryCache = new NodeCache({
    // This TTL must stay short, because we manually invalidate this cache
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false
})

export const getCacheStats = () => {
    return memoryCache.getStats()
}

export const flushInMemoryCache = () => {
    memoryCache.flushAll()
}

const isNodeRuntime = !process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === 'nodejs'

/**
 * GraphQL objects have explicit "foo: null" fields, we can remove them to save space
 * @returns
 */
function removeNull(obj: any): any {
    let clean = Object.fromEntries(
        Object.entries(obj)
            .map(([k, v]) => [k, v === Object(v) ? removeNull(v) : v])
            .filter(([_, v]) => v != null)
        // we keep empty objects around
        // otherwise "data" type  (empty objects are objects)
        // or boolean casts (empty objects are truthy)
        // might become inconsistent
    )
    return Array.isArray(obj) ? Object.values(clean) : clean
}

interface Metadata {
    key: string
    timestamp: string
    source: SourceType
    isCompressed?: boolean
}

export const cacheFunctions = {
    [CacheType.REDIS]: {
        fetch: fetchRedis,
        store: storeRedis
    }
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

export interface FetchPayload<T> {
    ___metadata: Metadata
    data: T
}

export interface FetchPayloadCompressed {
    ___metadata: Metadata
    data: string
}

export interface FetchPayloadSuccessOrError<T> extends FetchPayload<T> {
    error?: any
    cacheKey?: string
    duration: number
}

export function processFetchData<T>(
    data: any,
    source: SourceType,
    key: string
): FetchPayloadSuccessOrError<T> {
    const timestamp = new Date().toISOString()
    const ___metadata: Metadata = { key, source, timestamp }
    const result = { data, ___metadata, cacheKey: key }
    return removeNull(result)
}

const setResultSource = (result: any, source: SourceType) => {
    return {
        ...result,
        ___metadata: { ...result.___metadata, source }
    }
}
async function getFromCacheOrSource<T = any>({
    key,
    fetchFromSource,
    calledFromLog,
    shouldUpdateCache = true,
    shouldCompress = false,
    cacheType = CacheType.REDIS
}: {
    key: string
    fetchFromSource: () => Promise<T>
    calledFromLog: any
    shouldUpdateCache?: boolean
    shouldCompress?: boolean
    cacheType?: CacheType.REDIS
}) {
    const cachedData = await fetchPayload<T>(key, { cacheType })
    if (cachedData) {
        console.debug(`🔵 [${key}] in-memory cache miss, remote cache hit ${calledFromLog}`)
        return cachedData
    }
    console.debug(`🟣 [${key}] in-memory & remote cache miss, fetching from API ${calledFromLog}`)
    const result = await fetchFromSource()
    const processedResult = processFetchData<T>(result, SourceType.API, key)
    if (shouldUpdateCache) {
        // store in Redis
        await storePayload<T>(key, setResultSource(processedResult, SourceType.REDIS), {
            shouldCompress,
            cacheType
        })
    }
    return processedResult
}

/**
 * TODO: work in progress, rewrite getFromCache as a pipeline for simplicity
 * need to be careful to have the same compression logic than the existing method
 * 
 * Also, this version doesn't handle concurrency out of the box
 * We expect the caller to handle it, eg via Next.js unstable_cache/app router
 * 
 * NOTE: it's perhaps to build generic pipelines within each app,
 * to avoid having a too generic function with a ton of config,
 * so this function might not be needed at all
 * See "fetch-locales"
 */
async function getFromCachePipeline<T = any>({
    key,
    disableCache: disableCacheOption,
    disableMemoryCache,
    disableRedisCache,
    redisUrl,
    redisToken
}: {
    key: string,
    /**
     * Disable all caches, will use the source of truth directly
     * 
     * Previously "shouldGetFromCache", but reversed
     * Gets priority over env variables
     * If not set, DISABLE_CACHE env variable allow to disable caches too
     */
    disableCache: boolean,
    disableMemoryCache: boolean
    disableRedisCache: boolean,
    redisUrl: string,
    redisToken: string
}) {
    const startAt = new Date()
    const disableCacheEnv = !!process.env.DISABLE_CACHE
    const disableCache = disableCacheOption ?? disableCacheEnv

    // Needed even if we disable Redis for now
    if (!disableCache || disableRedisCache) {
        initRedis(redisUrl, redisToken)
    }
    const pipeline: Array<FetchPipelineStep<T>> = [
        // TODO: it will trigger cache misses
        // how to deduplicate?
        {
            get: () => {
                return memoryCache.get<T>(key)
            },
            set: (data) => {
                memoryCache.set<T>(key, data)
            },
            disabled: disableCache || disableMemoryCache,
            name: "In-memory"
        }, /*{
            get: () => {

            }
            disabled: disableCache || disableRedisCache
        }, {

        }*/
    ]
    const data = await runFetchPipeline(pipeline)
    const endAt = new Date()
    const duration = endAt.getTime() - startAt.getTime()
    const result = {
        data,
        duration
    }
    return result
}

/**
 * Generic function to fetch something from cache, or store it if cache misses
 * 
 * Handls concurrency out of the box
 * 
 * TODO: replace by the pipeline version for simplification
 * @returns
 */
export async function getFromCache<T = any>({
    key,
    fetchFunction: fetchFromSource,
    calledFrom,
    redisUrl,
    redisToken,
    shouldGetFromCache: shouldGetFromCacheOptions,
    shouldUpdateCache = true,
    shouldThrow = true,
    shouldCompress = false,
    cacheType = CacheType.REDIS
}: GetFromCacheOptions<T>) {
    const startAt = new Date()
    let inMemory = false
    initRedis(redisUrl, redisToken)
    const calledFromLog = calledFrom ? `(↪️  ${calledFrom})` : ''

    const shouldGetFromCacheEnv = !(process.env.DISABLE_CACHE === 'true')
    const shouldGetFromCache = shouldGetFromCacheOptions ?? shouldGetFromCacheEnv

    async function fetchAndProcess<T>(source: SourceType) {
        const data = await fetchFromSource()
        return processFetchData<T>(data, source, key)
    }

    let resultPromise: Promise<FetchPayload<T>>

    try {
        // 1. we have the a promise that resolve to the data in memory => return that
        if (shouldGetFromCache && memoryCache.has(key)) {
            console.debug(`🟢 [${key}] in-memory cache hit ${calledFromLog}`)
            inMemory = true
            resultPromise = memoryCache.get<Promise<FetchPayload<T>>>(key)!
        } else {
            // 2. store a promise that will first look in Redis, then in the main db
            if (shouldGetFromCache) {
                resultPromise = getFromCacheOrSource<T>({
                    key,
                    fetchFromSource,
                    calledFromLog,
                    shouldUpdateCache,
                    shouldCompress
                })
            } else {
                console.debug(
                    `🟡 [${key}] Redis cache disabled, fetching from source ${calledFromLog}`
                )
                resultPromise = fetchAndProcess<T>(SourceType.API)
                if (shouldUpdateCache) {
                    const result = await resultPromise
                    // store in Redis or other
                    await storePayload<T>(
                        key,
                        {
                            ...result,
                            ___metadata: { ...result.___metadata, source: SourceType.REDIS }
                        },
                        { shouldCompress, cacheType }
                    )
                }
            }
            memoryCache.set(key, resultPromise)
        }
        let result = (await resultPromise) as FetchPayloadSuccessOrError<T>
        if (inMemory) {
            result = setResultSource(result, SourceType.MEMORY)
        } else {
            await logToFile(`fetch/${key}.json`, result, {
                mode: 'overwrite'
            })
        }

        const endAt = new Date()
        result.duration = endAt.getTime() - startAt.getTime()
        return result
    } catch (error: any) {
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
    const apiUrl = getEnvVar(EnvVar.API_URL) //process.env.API_URL
    if (!apiUrl) {
        throw new Error('process.env.API_URL not defined, it should point the the API')
    }
    return apiUrl
}

function extractQueryName(queryString: string) {
    const regex = /query\s+(\w+)/
    const match = regex.exec(queryString)
    return match ? match[1] : null
}

/**
 * Generic GraphQL fetcher
 * Allows to override the API URL
 * and all other fetch options like "cache"
 * @param param0 
 * @returns 
 */
export async function graphqlFetcher<TData = any, TVar = any>(
    query: string,
    variables?: TVar,
    fetchOptions?: Partial<ResponseInit>,
    apiUrl_?: string,
): Promise<{
    data?: TData,
    errors?: Array<Error>
}> {
    const apiUrl = apiUrl_ || getApiUrl()
    // console.debug(`// querying ${apiUrl} (${query.slice(0, 15)}...)`)
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables: {} }),
        ...(fetchOptions || {})
    })
    const json: any = await response.json()
    return json
}

/**
 * Generic GraphQL fetcher
 * 
 * Returns null in case of error
 * 
 * @deprecated This function handles file logging internally,
 * it should be handled at app level instead
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
    await logToFile(`graphql/${key}.gql`, query)

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
        console.error(`// fetchGraphQLApi error 1 for query ${key}.gql (${apiUrl})`)
        console.error(JSON.stringify(json.errors, null, 2))
        throw new Error(json.errors[0].message)
    }

    return json.data || {}
}

type StorePayloadOptions = {
    shouldCompress: boolean
    cacheType: CacheType
}

type GenericStoreFunction = (key: string, val: any) => Promise<boolean>

// store payload in cache, compressing it if needed
export async function storePayload<T>(
    key: string,
    payload: FetchPayload<T>,
    options: StorePayloadOptions = {
        shouldCompress: false,
        cacheType: CacheType.REDIS
    }
): Promise<boolean> {
    const { shouldCompress, cacheType } = options
    const storeFunction = cacheFunctions[cacheType]['store'] as GenericStoreFunction

    if (shouldCompress && isNodeRuntime) {
        const { compressJSON } = await import('./compress')

        const compressedData = await compressJSON(payload.data)
        const compressedPayload = {
            ...payload,
            ___metadata: { ...payload.___metadata, isCompressed: true },
            data: compressedData
        }
        return await storeFunction(key, compressedPayload)
    } else {
        return await storeFunction(key, payload)
    }
}

type FetchPayloadOptions = {
    cacheType: CacheType
}

type GenericFetchFunction<T> = (key: string) => Promise<FetchPayload<T> | null>

// store payload in cache, compressing it if needed
export async function fetchPayload<T>(
    key: string,
    options: FetchPayloadOptions = { cacheType: CacheType.REDIS }
): Promise<FetchPayload<T> | null> {
    const { cacheType } = options
    const fetchFunction = cacheFunctions[cacheType]['fetch'] as GenericFetchFunction<T>

    const payload = await fetchFunction(key)
    if (payload?.___metadata?.isCompressed && isNodeRuntime) {
        const { decompressJSON } = await import('./compress')
        const uncompressedData = (await decompressJSON(payload.data)) as T
        return {
            ...payload,
            data: uncompressedData
        }
    } else {
        return payload
    }
}
