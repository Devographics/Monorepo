import { Redis } from '@upstash/redis'

let redis

export function initRedis() {
    const url = process.env.REDIS_UPSTASH_URL
    const token = process.env.REDIS_TOKEN
    // console.debug('init redis client', url, token)
    if (!redis) {
        // redis = new Redis(redisUrl)
        redis = new Redis({
            // @ts-expect-error TODO why the TS error? probably  a mismatch with another Redis type from another client
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
