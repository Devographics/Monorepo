import NodeCache from 'node-cache'
export const memoryCache = new NodeCache({
    // This TTL must stay short, because we manually invalidate this cache
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false
})
export const getCacheStats = () => {
    return memoryCache.getStats()
}
export const flushInMemoryCache = () => {
    memoryCache.flushAll()
}