
/**
 * Get caching methods based on current config
 * It can enable or disable either caching or writing, depending on the cache type
 */
export const allowedCachingMethods = (): {
    /**
     * .logs folder (only used for writing, for debugging purpose)
    */
    filesystem: boolean,
    /**
     * GraphQL API
     * TODO: it's not a cache but the source of truth, why using this?
     */
    api: boolean,
    /**
     * Redis
     */
    redis: boolean,
} => {
    let cacheLevel = { filesystem: true, api: true, redis: true }
    if (process.env.DISABLE_CACHE === 'true') {
        cacheLevel = { filesystem: false, api: false, redis: false }
    } else {
        if (process.env.DISABLE_FILESYSTEM_CACHE === 'true') {
            cacheLevel.filesystem = false
        }
        if (process.env.DISABLE_API_CACHE === 'true') {
            cacheLevel.api = false
        }
        if (process.env.DISABLE_REDIS_CACHE === 'true') {
            cacheLevel.redis = false
        }
    }
    return cacheLevel
}