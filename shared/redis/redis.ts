import Redis from 'ioredis'
let redis: Redis
import { logToFile } from '@devographics/helpers'

export function initRedis(redisUrl: string) {
    // console.debug("init redis client");
    if (!redis) {
        redis = new Redis(redisUrl)
    }
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
    const res = await redisClient.set(key, JSON.stringify(val), 'EX', TTL_SECONDS)
    if (res !== 'OK') {
        console.error("Can't store JSON into Redis, error:" + res)
        return false
    }
    return true
}

export async function fetchJson<T = any>(key: string): Promise<T | null> {
    const redisClient = getRedisClient()
    const str = await redisClient.get(key)
    if (!str) return null
    try {
        const json = JSON.parse(str)
        await logToFile(`fetchJson(${key}).json`, json, { mode: 'overwrite' })
        return json
    } catch (err) {
        redisClient.del(key).catch(err => {
            console.error(`Could not delete malformed Redis value for key ${key}`)
        })
        throw new Error(`Malformed value in Redis cache ${key}}: ${str}`)
    }
}
