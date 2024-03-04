/**
 * TODO:
 * - reuse this logic with surveyform
 * - try to unify with the generic fetching method of "@devographics/fetch"
 */

// We currently can't import any @devographics shared packages here
// So we have to copy paste all code and use helpers from this app...

import { getLocalesQuery, getLocaleContextQuery } from './graphql'
// import { logToFile } from '@devographics/debug'
// import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { initRedis, fetchJson as fetchRedis, storeRedis } from '../redis/redis'
import { Locale, LocaleWithStrings, Translation } from "./typings"
// TODO: can't be imported because "@devographics/helpers" can't be imported somehow
import { FetchPipelineStep, runFetchPipeline } from '../fetch/pipeline'
import { allowedCachingMethods } from '../helpers'
import { logToFile } from '../log_to_file'

export function removeNull(obj: any): any {
    const clean = Object.fromEntries(
        Object.entries(obj)
            .map(([k, v]) => [k, v === Object(v) ? removeNull(v) : v])
            .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length))
    )
    return Array.isArray(obj) ? Object.values(clean) : clean
}

const allLocalesCacheKey = () => `${process.env.APP_NAME}__allLocales__metadata`
const getLocaleContextCacheKey = (localeId: string, context: string) =>
    `${process.env.APP_NAME}__locale__${localeId}__${context}__parsed`

/**
 * TODO: does it get the strings too?
 * @param param0 
 * @returns 
 */
export const getLocalesGraphQL = async ({ graphql, contexts, key }) => {
    const localesQuery = getLocalesQuery(contexts, false)
    // 
    logToFile(`locales/${key}.graphql`, localesQuery)

    const localesResults = removeNull(
        await graphql(
            `
                ${localesQuery}
            `
        )
    )
    logToFile(`locales/${key}.json`, localesResults)
    const locales = localesResults.data.dataAPI.locales
    return locales
}

export const getLocaleContextGraphQL = async ({ localeId, context, graphql, key }) => {
    const localesQuery = getLocaleContextQuery(localeId, context)
    logToFile(`locales/${key}.graphql`, localesQuery)

    const localesResults = removeNull(
        await graphql(
            `
                ${localesQuery}
            `
        )
    )
    logToFile(`locales/${key}.json`, localesResults)
    const locale = localesResults.data.dataAPI.locale

    return locale
}


/**
 * Generic get/set for redis, for a given cache key
 * @param cacheKey 
 * @returns 
 */
function redisFetchStep<T = any>(cacheKey: string): FetchPipelineStep<T> {
    initRedis()
    return {
        get: async () => {
            return await fetchRedis<T>(cacheKey)
        },
        set: async (locales) => {
            await storeRedis(cacheKey, locales)
        },
        name: "redis"
    }
    //return { get: () => null, set: () => { } }
}

async function getAllLocaleDefinitions({ graphql, contexts }: {
    /** ? */
    graphql?: any,
    /** I18n scopes */
    contexts: Array<string>
}): Promise<Array<Locale>> {
    const allowedCaches = allowedCachingMethods()
    const allLocalesKey = allLocalesCacheKey()

    const localesFetchSteps: Array<FetchPipelineStep<Array<Locale>>> = [
        // log locales in file system for debugging
        {
            name: "logToFile",
            set: (locales) => {
                logToFile('localesMetadataRedis.json', locales)
            },
            disabled: !allowedCaches.filesystem,
        },
        // get from Redis
        {
            ...redisFetchStep(allLocalesKey),
            disabled: !allowedCaches.redis
        },
        // GraphQL API = source of truth
        {
            get: async () => {
                return await getLocalesGraphQL({ graphql, contexts, key: allLocalesKey })
            }
        }
    ]
    const localeDefinitions = await runFetchPipeline(localesFetchSteps)
    if (!localeDefinitions) throw new Error("Couldn't get locales")
    return localeDefinitions
}

async function getLocaleContextStrings({ locale, context, graphql }: { locale: Locale, context: string, graphql: any }) {
    const allowedCaches = allowedCachingMethods()
    const contextKey = getLocaleContextCacheKey(locale.id, context)
    const localeContextStringsFetchSteps: Array<
        FetchPipelineStep<Array<Translation>>> = [
            {
                ...redisFetchStep(contextKey),
                disabled: !allowedCaches.redis
            },
            {
                get: async () => {
                    const data = await getLocaleContextGraphQL({
                        localeId: locale.id,
                        context,
                        graphql,
                        key: contextKey
                    })
                    console.log("LOCALE", { data })
                    return data?.strings
                }
            },


        ]
    const strings = await runFetchPipeline(localeContextStringsFetchSteps)
    if (!strings) throw new Error(`Strings not found for locale ${locale.id}`)
    return strings
}

/**
 * Get the strings for some locales and contexts
 */
export const getLocalesWithStrings = async ({ localeIds, graphql, contexts }: {
    /**
     * Language to fetch
     */
    localeIds?: Array<string>,
    /** ? */
    graphql?: any,
    /** I18n scopes */
    contexts: Array<string>
}): Promise<Array<LocaleWithStrings>> => {
    // Filtering by id
    let locales: Array<Locale> = await getAllLocaleDefinitions({ graphql, contexts })
    if (localeIds && localeIds.length > 0) {
        locales = locales.filter(({ id }) => localeIds.includes(id))
    }
    // Fetch strings and shove into the locale
    // TODO: we should be able to do that directly using the graphql API,
    // the whole point being to avoid this kind of cascading fetches
    for (const locale of locales) {
        let localeStrings: Array<Translation> = []
        for (const context of contexts) {
            const strings = await getLocaleContextStrings({ locale, context, graphql })
            console.log({ strings, localeStrings })
            localeStrings = [...localeStrings, ...strings]
        }
        locale.strings = localeStrings
    }
    logToFile('localesResultsRedis.json', locales)
    // @ts-ignore inference is bad...
    return locales
}
