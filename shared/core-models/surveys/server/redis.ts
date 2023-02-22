import Redis from "ioredis";
let redis: Redis

export function initRedis(redisUrl: string) {
    console.debug("init redis client")
    if (!redis) {
        redis = new Redis(redisUrl)
    }
}

export const getRedisClient = () => {
    console.debug("get redis client")
    if (!redis) throw new Error("Calling getRedisClient before calling initRedis")
    return redis;
};