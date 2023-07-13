// import Redis from 'ioredis'
import { logToFile } from '@devographics/debug'
import { getConfig } from '@devographics/helpers'
import { Redis } from '@upstash/redis'

let redis: Redis

export function initRedis(url_?: string, token_?: string) {
    const config = getConfig()
    const url = url_ || config.REDIS_UPSTASH_URL
    const token = token_ || config.REDIS_TOKEN

    // console.debug("init redis client");
    if (!redis) {
        // redis = new Redis(redisUrl)
        redis = new Redis({
            url,
            token
        })
    }
    return redis
}

export const getRedisClient = () => {
    // console.debug("get redis client");
    if (!redis) throw new Error('Calling getRedisClient before calling initRedis')
    return redis
}

// TODO: feed the cache in surveyadmin

// Redis data fetching
// All methods will return null if data are not in the cache
// => use either a local or a github load when it happen

// This TTL can be long (multiple hours) since we can manually invalidate Redis cache if needed
const TTL_SECONDS = 60 * 60 * 2

export async function storeRedis<T>(key: string, val: T): Promise<boolean> {
    const redisClient = getRedisClient()
    // EX = Expiration time in seconds
    // io-redis version
    // const res = await redisClient.set(key, JSON.stringify(val), 'EX', TTL_SECONDS)
    // upstash-redis version
    const res = await redisClient.set(key, JSON.stringify(val), { ex: TTL_SECONDS })

    if (res !== 'OK') {
        console.error("Can't store JSON into Redis, error:" + res)
        return false
    }
    return true
}

export async function fetchJson<T = any>(key: string): Promise<T | null> {
    let maybeStr: string | any
    const redisClient = getRedisClient()
    try {
        maybeStr = await redisClient.get(key)
        if (!maybeStr) return null
        // note: depending on Redis client, str might already be a valid object
        const json = typeof maybeStr === 'object' ? maybeStr : JSON.parse(maybeStr)
        await logToFile(`fetchJson(${key}).json`, json, { mode: 'overwrite' })
        return json
    } catch (err) {
        console.error(`// error while getting redis key ${key}`, err)
        redisClient.del(key).catch(err => {
            console.error(
                `Could not delete malformed Redis value for key ${key}. Is your Redis URL or token valid?`,
                err
            )
            // NOTE: if this deletion call fails too, this is probably because the Redis server can't be reached
            // for instance if your HTTP proxy or upstash token is invalid
        })
        throw new Error(`Malformed value for Redis key [${key}]: ${maybeStr}`)
    }
}
