
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { type FetchPipelineStep } from './pipeline'

/**
 * Generic get/set for redis, for a given cache key
 */
export function redisFetchStep<T = any>(cacheKey: string): FetchPipelineStep<T> {
    initRedis()
    return {
        name: "redis",
        get: async () => {
            return await fetchRedis<T>(cacheKey)
        },
        set: async (locales) => {
            await storeRedis(cacheKey, locales)
        },
    }
}