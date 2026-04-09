
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { type FetchPipelineStep } from './pipeline'
import { allowedCachingMethods } from './helpers'

/**
 * Generic get/set for redis, for a given cache key
 */
export function redisPipelineStep<T = any>(cacheKey: string): FetchPipelineStep<T> {
    const disabled = !allowedCachingMethods().redis
    if (!disabled) {
        initRedis()
    }
    return {
        name: "redis",
        get: async () => {
            return await fetchRedis<T>(cacheKey)
        },
        set: async (locales) => {
            await storeRedis(cacheKey, locales)
        },
        disabled
    }
}
