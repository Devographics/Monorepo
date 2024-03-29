/**
 * TODO:
 * - reuse this logic with surveyform
 * - try to unify with the generic fetching method of "@devographics/fetch"
 */
import { getLocalesQuery, getLocaleContextQuery } from './graphql'
import { logToFile } from '@devographics/debug'
import { initRedis, fetchJson as fetchRedis, storeRedis } from '@devographics/redis'
import { Locale, LocaleWithStrings, Translation } from "../typings"
import { FetchPipelineStep, runFetchPipeline, allowedCachingMethods, graphqlFetcher, pipeline } from '@devographics/fetch'

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
export const getLocalesGraphQL = async ({ contexts, key }: { contexts: Array<string>, key: string }) => {
    const localesQuery = getLocalesQuery(contexts, false)
    // 
    logToFile(`locales/${key}.graphql`, localesQuery)



    const fullResult = await graphqlFetcher(
        `
                ${localesQuery}
            `
    )
    if (!fullResult) throw new Error("Graphql fetcher function did not return an object")
    // TODO: maybe it should be the responsibilit of the graphql fetch to remove null fields?
    const localesResults = removeNull(fullResult)
    logToFile(`locales/${key}.json`, localesResults)
    console.log("fullResults", fullResult)
    const locales = localesResults.data.locales
    return locales
}

export const getLocaleContextGraphQL = async ({ localeId, context, key }: { localeId: string, context: string, key: string }) => {
    const localesQuery = getLocaleContextQuery(localeId, context)
    logToFile(`locales/${key}.graphql`, localesQuery)

    const localesResults = removeNull(
        await graphqlFetcher(
            `
                ${localesQuery}
            `
        )
    )
    logToFile(`locales/${key}.json`, localesResults)
    const locale = localesResults.data.locale

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
}

async function getAllLocaleDefinitions({ contexts }: {
    /** I18n scopes */
    contexts: Array<string>
}): Promise<Array<Locale>> {
    const allowedCaches = allowedCachingMethods()
    const allLocalesKey = allLocalesCacheKey()

    const localeDefinitions = await pipeline<Array<Locale>>().steps(
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
                return await getLocalesGraphQL({ contexts, key: allLocalesKey })
            }
        }
    )
        .run()
    if (!localeDefinitions) throw new Error("Couldn't get locales")
    return localeDefinitions
}

async function getLocaleContextStrings({ locale, context }: { locale: Locale, context: string }) {
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
                        key: contextKey
                    })
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
export const getLocalesWithStrings = async ({ localeIds, contexts }: {
    /**
     * Language to fetch
     */
    localeIds?: Array<string>,
    /** I18n scopes */
    contexts: Array<string>
}): Promise<Array<LocaleWithStrings>> => {
    // We always get all locales definitions, and filters afterwards
    // TODO: improve to get a single call
    let locales: Array<Locale> = await getAllLocaleDefinitions({ contexts })
    if (localeIds && localeIds.length > 0) {
        locales = locales.filter(({ id }) => localeIds.includes(id))
    }
    // Fetch strings and shove into the locale
    // TODO: we should be able to do that directly using the graphql API,
    // the whole point being to avoid this kind of cascading fetches
    for (const locale of locales) {
        let localeStrings: Array<Translation> = []
        for (const context of contexts) {
            const strings = await getLocaleContextStrings({ locale, context })
            localeStrings = [...localeStrings, ...strings]
        }
        locale.strings = localeStrings
    }
    logToFile('localesResultsRedis.json', locales)
    // @ts-ignore inference is bad...
    return locales
}
