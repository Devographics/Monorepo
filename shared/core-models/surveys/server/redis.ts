import Redis from "ioredis";
let redis: Redis

export function initRedis(redisUrl: string) {
    redis = new Redis(redisUrl)
}

export const getRedisClient = () => {
    if (!redis) throw new Error("Calling getRedisClient before calling initRedis")
    return redis;
};