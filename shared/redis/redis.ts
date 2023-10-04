// import Redis from 'ioredis'
import { logToFile } from '@devographics/debug'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import { Redis } from '@upstash/redis'

// 30 mn (but only 3 in dev)
const TTL_SECONDS = process.env.NODE_ENV === "development" ? 60 * 3 : 60 * 30

let redis: Redis

export function initRedis(url_?: string, token_?: string) {
    const url = url_ || getEnvVar(EnvVar.REDIS_UPSTASH_URL)
    const token = token_ || getEnvVar(EnvVar.REDIS_TOKEN)
    // console.debug('init redis client', url, token)
    if (!redis) {
        if (!url) {
            throw new Error('initRedis: url is not defined')
        }
        if (!token) {
            throw new Error('initRedis: token is not defined')
        }
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
    } else {
        console.debug(`🟡 [${key}] Redis cache updated`)
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
    } catch (error) {
        console.error(`// error while getting redis key ${key}`)
        // redisClient.del(key).catch(err => {
        //     console.error(`Could not delete malformed Redis value for key ${key}`, err)
        //     // NOTE: if this deletion call fails too, this is probably because the Redis server can't be reached
        //     // for instance if your HTTP proxy or upstash token is invalid
        // })
        throw error
    }
}
