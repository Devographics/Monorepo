import { localeWithStringsCacheKey } from './cache_keys'
import { fetchAllLocalesMetadata, fetchEditionMetadata, fetchSurveysMetadata } from './functions'
import { FetcherFunctionOptions } from './types'
import { AppName } from '@devographics/types'
import { EnvVar, parseEnvVariableArray, getEnvVar } from '@devographics/helpers'

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

// TODO: de-dupe baseContexts and getCommonContexts from surveyform,
// move to i18n package
const baseContexts = ['common', 'surveys', 'accounts']

// see https://youmightnotneed.com/lodash#uniq
const uniq = a => [...new Set(a)]

// i18n contexts common to all surveys and editions
export const getCommonContexts = () => {
    const customContexts = parseEnvVariableArray(getEnvVar(EnvVar.CUSTOM_LOCALE_CONTEXTS))
    return uniq([...baseContexts, ...customContexts]) as string[]
}

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
        refreshedCacheKeys.push(
            localeWithStringsCacheKey({
                ...options,
                localeId: locale.id,
                contexts: getCommonContexts()
            })
        )
        // end

        // survey-specific context
        // KEEP in sync with surveyform layouts that fetch the locales
        for (const survey of allSurveys) {
            for (const edition of survey.editions) {
                console.log(`// Refreshing ${locale.id} metadata cache… (${survey.id})`)
                refreshedCacheKeys.push(
                    localeWithStringsCacheKey({
                        ...options,
                        localeId: locale.id,
                        contexts: [...getCommonContexts(), survey.id, edition.id]
                    })
                )
            }
        }
    }

    return { refreshedCacheKeys }
}
