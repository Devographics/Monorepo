import dotenv from 'dotenv'

interface AppSettings {
    cacheType: 'local' | 'redis'
    disableCache: boolean
    loadLocalesMode?: 'local'
    githubToken: string
    redisUrl: string
}
/**
 * TODO: Centralize .env loading here
 *
 *    NOTE: when building as ESM, it seems that modules logic will be run
 *    BEFORE server.ts => be careful on top-level code that uses process.env,
 *    values might be undefined
 */
const loadSettings = () => {
    dotenv.config()
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    const cacheType = process.env.CACHE_TYPE === 'local' ? 'local' : 'redis'
    const disableCache = !!process.env.DISABLE_CACHE
    const loadLocalesMode = process.env.LOAD_DATA
    if (loadLocalesMode && !['local'].includes(loadLocalesMode)) {
        throw new Error(`LOAD_LOCALES possible values: ["local"]; found: ${loadLocalesMode}`)
    }
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
        throw new Error(`GITHUB_TOKEN should be defined`)
    }

    const settings: AppSettings = {
        cacheType,
        disableCache,
        loadLocalesMode: loadLocalesMode as 'local' | undefined,
        githubToken,
        redisUrl
    }
    return settings
}

export const appSettings = loadSettings()
