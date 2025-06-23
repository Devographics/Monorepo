import dotenv from 'dotenv'

export interface AppSettings {
    cacheType: 'local' | 'memory' | 'redis'
    disableCache: boolean
    /**
     * Whether we get entities and surveys from local folders
     * or from github
     *
     * @example LOAD_DATA=local
     */
    loadLocalesMode?: 'local'
    /**
     * Relevant when loading data locally
     * @example ENTITIES_DIR=entities will fetch entities in ../../entities relative to "api" folder
     */
    entitiesDir?: string
    surveysDir?: string
    localesDir?: string
    githubToken: string
}
/**
 * TODO: Centralize .env loading here
 *
 *    NOTE: when building as ESM, it seems that modules logic will be run
 *    BEFORE server.ts => be careful on top-level code that uses process.env,
 *    values might be undefined
 */
export const loadSettings = () => {
    const cacheType = process.env.CACHE_TYPE
    const disableCache = process.env.DISABLE_CACHE === 'true'
    const loadLocalesMode = process.env.LOAD_DATA
    // if (loadLocalesMode && !['local'].includes(loadLocalesMode)) {
    //     throw new Error(`LOAD_LOCALES possible values: ["local"]; found: ${loadLocalesMode}`)
    // }
    const githubToken = process.env.GITHUB_TOKEN
    // if (!githubToken) {
    //     throw new Error(`GITHUB_TOKEN should be defined`)
    // }

    const settings: AppSettings = {
        cacheType,
        disableCache,
        loadLocalesMode: loadLocalesMode as 'local' | undefined,
        githubToken
    }
    if (loadLocalesMode === 'local') {
        function loadEnvVar(
            settings: AppSettings,
            settingName: 'surveysDir' | 'entitiesDir' | 'localesDir',
            envVarName: string
        ) {
            if (!process.env[envVarName]) {
                // throw new Error(
                //     `${envVarName} not defined while using local data loading mode for setting ${settingName}`
                // )
            }
            settings[settingName] = process.env[envVarName]
        }
        loadEnvVar(settings, 'entitiesDir', 'ENTITIES_DIR')
        loadEnvVar(settings, 'surveysDir', 'SURVEYS_DIR')
        loadEnvVar(settings, 'localesDir', 'LOCALES_DIR')
    }
    return settings
}
