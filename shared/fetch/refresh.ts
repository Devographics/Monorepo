import { localeCacheKey, localeWithStringsCacheKey } from './cache_keys'
import {
    fetchAllLocalesMetadata,
    fetchEditionMetadata,
    fetchLocale,
    fetchSurveysMetadata
} from './functions'
import { FetcherFunctionOptions } from './types'
import { AppName } from '@devographics/types'

//   export const refreshCache = async (args) => {
//     const { key } = args;
//     return { key };
//   };

export const refreshSurveysCache = async args => {
    const { target } = args
    const refreshedCacheKeys: string[] = []
    // get list of all surveys
    console.log('// Refreshing all surveys metadata cache…')
    const options: FetcherFunctionOptions = {
        appName: AppName.SURVEYFORM,
        shouldUpdateCache: true,
        shouldGetFromCache: false
    }

    if (target === 'development' || target === 'staging') {
        console.log('-> Target: staging cache database')
        options.redisUrl = process.env.REDIS_UPSTASH_URL_STAGING
        options.redisToken = process.env.REDIS_TOKEN_STAGING
    } else {
        console.log('-> Target: production cache database')
    }

    const { data: allSurveys, cacheKey } = await fetchSurveysMetadata(options)
    refreshedCacheKeys.push(cacheKey!)

    for (const survey of allSurveys) {
        for (const edition of survey.editions) {
            console.log(`// Refreshing ${edition.id} metadata cache…`)

            const { cacheKey } = await fetchEditionMetadata({
                ...options,
                surveyId: survey.id,
                editionId: edition.id
            })
            refreshedCacheKeys.push(cacheKey!)
        }
    }
    return { refreshedCacheKeys }
}

// i18n contexts common to all surveys and editions
export const getCommonContexts = () => ['common', 'surveys', 'accounts']

/**
 * Refresh Redis cache for locales
 * 
 * We do so by computing the keys based on locale list
 * 
 * TODO: it might be more robust to issue Redis commands
 * removing keys based on  a prefix instead
 */
export const refreshLocalesCache = async args => {
    const { localeIds, target } = args
    const { data: allSurveys } = await fetchSurveysMetadata()

    const refreshedCacheKeys: string[] = []
    // get list of all locales
    console.log('// Refreshing all locales metadata cache…')
    const options: FetcherFunctionOptions = {
        appName: AppName.SURVEYFORM,
        shouldUpdateCache: true,
        shouldGetFromCache: false
    }

    if (target === 'development' || target === 'staging') {
        console.log('-> Target: staging cache database')
        options.redisUrl = process.env.REDIS_UPSTASH_URL_STAGING
        options.redisToken = process.env.REDIS_UPSTASH_TOKEN_STAGING
    } else {
        console.log('-> Target: production cache database')
    }

    const { data: allLocales, cacheKey } = await fetchAllLocalesMetadata(options)
    refreshedCacheKeys.push(cacheKey!)

    const locales = localeIds ? allLocales.filter(l => localeIds.includes(l.id)) : allLocales

    for (const locale of locales) {
        // common contexts
        console.log(
            `// Refreshing ${locale.id} metadata cache… (${getCommonContexts().join(', ')})`
        )

        // Legacy locales loading
        // remove when this function is not used anymore in surveyform
        const cacheKey = localeCacheKey({ ...options, localeId: locale.id, contexts: getCommonContexts() }) /*await fetchLocale({
            ...options,
            localeId: locale.id,
            contexts: getCommonContexts()
        })*/
        refreshedCacheKeys.push(cacheKey!)
        // New version
        refreshedCacheKeys.push(localeWithStringsCacheKey({ ...options, localeId: locale.id, contexts: getCommonContexts() }))

        // end

        // survey-specific context
        for (const survey of allSurveys) {
            console.log(`// Refreshing ${locale.id} metadata cache… (${survey.id})`)
            const cacheKey = localeCacheKey({ ...options, localeId: locale.id, contexts: [survey.id] }) /*await fetchLocale({
                ...options,
                localeId: locale.id,
                contexts: [survey.id]
            })*/
            refreshedCacheKeys.push(cacheKey!)
            refreshedCacheKeys.push(localeWithStringsCacheKey({ ...options, localeId: locale.id, contexts: getCommonContexts() }))
        }
    }

    return { refreshedCacheKeys }
}
