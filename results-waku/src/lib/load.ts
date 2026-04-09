import { getLocalJSON, getLocalString } from '@devographics/filesystem'

const DEFAULT_SURVEYS_URL = 'https://devographics.github.io/surveys'

/**
 * Get caching methods based on current config
 * It can enable or disable either caching or writing, depending on the cache type
 */
export const allowedCachingMethods = (): {
    /**
     * .logs folder (only used for writing, for debugging purpose)
     */
    filesystem: boolean
    /**
     * GraphQL API
     * TODO: it's not a cache but the source of truth, why using this?
     */
    api: boolean
    /**
     * Redis
     */
    redis: boolean
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

// if SURVEYS_URL is defined, then use that to load surveys;
// if not, look in local filesystem
export const getLoadMethod = () =>
    process.env.SURVEYS_PATH && !process.env.SURVEYS_URL ? 'local' : 'remote'

export const getDataLocations = (surveyId: string, editionId: string) => {
    const surveysUrl = process.env.SURVEYS_URL || DEFAULT_SURVEYS_URL
    return {
        localPath: `${process.env.SURVEYS_PATH}/${surveyId}/${editionId}`,
        url: `${surveysUrl}/${surveyId}/${editionId}`
    }
}

/*

Get a JSON object from the disk or from GitHub

*/
export const getFileAsJSON = async ({
    localPath,
    remoteUrl
}: {
    localPath: string
    remoteUrl: string
}) => {
    let contents, data
    if (getLoadMethod() === 'local') {
        data = await getLocalJSON({ localPath })
    } else {
        console.log(`// fetching ${remoteUrl}…`)
        const response = await fetch(remoteUrl)
        contents = await response.text()
        data = JSON.parse(contents)
    }
    return data
}

/*

Get a file from the disk or from GitHub

*/
export const getFileAsString = async ({
    localPath,
    remoteUrl
}: {
    localPath: string
    remoteUrl: string
}) => {
    let contents
    if (getLoadMethod() === 'local') {
        contents = await getLocalString({ localPath })
    } else {
        console.log(`// fetching ${remoteUrl}…`)
        const response = await fetch(remoteUrl)
        contents = await response.text()
    }
    return contents
}
