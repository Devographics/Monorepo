
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { type FetchPipelineStep } from './pipeline'
import { allowedCachingMethods } from './helpers'

/**
 * Generic get/set for redis, for a given cache key
 * If enableCache is false, the cache is only written, never read
 * (useful to force fetching fresh data while still updating the cache)
 */
export function redisPipelineStep<T = any>(
    cacheKey: string,
    options: { enableCache?: boolean } = {}
): FetchPipelineStep<T> {
    const disabled = !allowedCachingMethods().redis
    if (!disabled) {
        initRedis()
    }
    return {
        name: "redis",
        get:
            options.enableCache === false
                ? undefined
                : async () => {
                      return await fetchRedis<T>(cacheKey)
                  },
        set: async (locales) => {
            await storeRedis(cacheKey, locales)
        },
        disabled
    }
}
