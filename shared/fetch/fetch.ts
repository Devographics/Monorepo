/**
 * 1) get from in-memory cache if available (short TTL because it can't be emptied)
 * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
 * 3) get from Github in last resort
 */
import NodeCache from 'node-cache'
import { fetchJson, storeRedis } from '@devographics/redis'
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

/**
 * Generic function to fetch something from cache, or store it if cache misses
 * @returns
 */
export async function getFromCache<T = any>(
    key: string,
    fetchFunc: () => Promise<T>,
    calledFrom?: string
) {
    let result
    const calledFromLog = calledFrom ? `(↪️  ${calledFrom})` : ''
    const enableCache = !(process.env.ENABLE_CACHE === 'false')

    const fetchAndStore = async () => {
        const promise = fetchFunc()
        memoryCache.set(key, promise)
        const result = await promise

        // store in Redis in the background
        await storeRedis<T>(key, removeNull(result))
        return result
    }

    if (memoryCache.has(key)) {
        console.debug(`🟢 [${key}] in-memory cache hit ${calledFromLog}`)
        result = await memoryCache.get<Promise<T>>(key)!
    } else {
        if (enableCache) {
            const redisData = await fetchJson<T>(key)
            if (redisData) {
                console.debug(`🔵 [${key}] in-memory cache miss, redis hit ${calledFromLog}`)
                result = redisData
            } else {
                console.debug(
                    `🟣 [${key}] in-memory & redis cache miss, fetching from API ${calledFromLog}`
                )
                result = await fetchAndStore()
            }
        } else {
            console.debug(`🟠 [${key}] cache disabled, fetching from API ${calledFromLog}`)
            result = await fetchAndStore()
        }
    }
    await logToFile(`${key}.json`, result, { mode: 'overwrite', subDir: 'fetch' })
    return result
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

export const fetchGraphQLApi = async ({
    query,
    key: key_,
    apiUrl: apiUrl_
}: {
    query: string
    key?: string
    apiUrl?: string
}): Promise<any> => {
    const apiUrl = apiUrl_ || getApiUrl()
    const key = key_ || extractQueryName(query)
    await logToFile(`${key}.gql`, query, { mode: 'overwrite', subDir: 'graphql' })

    // console.debug(`// querying ${apiUrl} (${query.slice(0, 15)}...)`)
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({ query, variables: {} }),
        // always get a fresh answer
        cache: 'no-store'
    })
    const json: any = await response.json()
    if (json.errors) {
        console.error('// surveysQuery API query error')
        console.error(JSON.stringify(json.errors, null, 2))
        throw new Error('Got some errors while calling a GraphQL API')
    }

    return json.data
}
