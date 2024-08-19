/**
 * TODO:
 * - reuse this logic with surveyform
 * - try to unify with the generic fetching method of "@devographics/fetch"
 */
import { getLocalesQuery, getLocaleContextQuery, localeWithStringsQuery } from './graphql'
import { logToFile } from '@devographics/debug'
import { Locale, LocaleParsed, LocaleWithStrings, Translation } from '../typings'
import {
    allowedCachingMethods,
    graphqlFetcher,
    cachedPipeline,
    localeWithStringsCacheKey
} from '@devographics/fetch'

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
 * Get list of locales, without strings
 * 
 * TODO: contexts are probably unused in this scenario, since we don't get strings
 *
 * @param param0
 * @returns
 */
export const getLocalesGraphQL = async ({
    contexts,
    key
}: {
    contexts?: Array<string>
    key: string
}) => {
    const localesQuery = getLocalesQuery(contexts, false)
    //
    logToFile(`locales/${key}.graphql`, localesQuery)

    const fullResult = await graphqlFetcher(
        `
                ${localesQuery}
            `
    )
    if (!fullResult) throw new Error('Graphql fetcher function did not return an object')
    // TODO: maybe it should be the responsibilit of the graphql fetch to remove null fields?
    const localesResults = removeNull(fullResult)
    logToFile(`locales/${key}.json`, localesResults)
    console.log('fullResults', fullResult)
    const locales = localesResults.data.locales
    return locales
}

export const getLocaleContextGraphQL = async ({
    localeId,
    context,
    key
}: {
    localeId: string
    context: string
    key: string
}) => {
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
 * Replaces fetchAllLocalesMetadata
 * @param param0 
 * @returns 
 */
export async function getAllLocaleDefinitions(): Promise<{ error: Error, locales: undefined } | { error: undefined, locales: Array<Pick<Locale, "label" | "id" | "translators" | "completion">> }> {
    const allLocalesKey = allLocalesCacheKey()
    const { data: localeDefinitions, error } = await cachedPipeline<Array<Locale>>({
        cacheKey: allLocalesKey
    })
        .steps(
            // GraphQL API = source of truth
            {
                get: async () => {
                    return await getLocalesGraphQL({ key: allLocalesKey })
                }
            }
        )
        .run()
    if (error) return { error, locales: undefined }
    if (!localeDefinitions) return { error: new Error("Couldn't get locales"), locales: undefined }
    return { locales: localeDefinitions, error: undefined }
}

async function getLocaleContextStrings({ locale, context }: { locale: Locale; context: string }) {
    const allowedCaches = allowedCachingMethods()
    const contextKey = getLocaleContextCacheKey(locale.id, context)
    const strings = await cachedPipeline<Array<Translation>>({
        cacheKey: contextKey
    })
        .fetcher(async () => {
            const data = await getLocaleContextGraphQL({
                localeId: locale.id,
                context,
                key: contextKey
            })
            return data?.strings
        })
        .run()
    if (!strings) throw new Error(`Strings not found for locale ${locale.id}`)
    return strings
}

/**
 * Newer function (2024) using fetch pipeline to get strings
 * @param param0
 * @returns
 */
export async function getLocaleDict({
    localeId,
    contexts
}: {
    localeId: string
    contexts: Array<string>
}) {
    const cacheKey = localeWithStringsCacheKey({ localeId, contexts })
    const { data: locale, error } = await cachedPipeline<LocaleWithStrings>({
        cacheKey
    })
        .fetcher(async () => {
            const { data, errors } = await graphqlFetcher<{
                locale: LocaleWithStrings
            }>(localeWithStringsQuery({ localeId, contexts }))
            if (errors?.length) throw new Error(errors.map(e => e.message).join('\n'))
            return data?.locale
        })
        .run()
    if (error) {
        console.log('// getLocaleDict error')
        console.log(error)
        return { error }
    }
    if (!locale) {
        return { error: new Error(`Locale ${localeId} not found`) }
    }
    // api returns an array
    // we transform to a record that is easier to consume
    // NOTE: we parse after the data fetching to avoid issues with caching different structure
    const dict: (typeof localeParsed)['dict'] = {}
    const { strings, ...localeDef } = locale
    strings.forEach((item /*{ key, t, tHtml }*/) => {
        // DO not try to pick t or tHtml here, keep both so each component can pick the right one
        // TODO: assess if it's the right decisio
        dict[item.key] = item //tHtml || t
    })
    const localeParsed: LocaleParsed = {
        ...localeDef,
        strings,
        dict
    }
    return { locale: localeParsed }
}
/**
 * Get the strings for some locales and contexts
 * @deprecated Use getLocaleDict
 */
export const getLocalesWithStrings = async ({
    localeIds,
    contexts
}: {
    /**
     * Language to fetch
     */
    localeIds?: Array<string>
    /** I18n scopes */
    contexts: Array<string>
}): Promise<Array<LocaleWithStrings>> => {
    // We always get all locales definitions, and filters afterwards
    // TODO: improve to get a single call
    const { error, locales: localesData } = await getAllLocaleDefinitions({ contexts })
    if (error) return []
    let locales = localesData
    if (localeIds && localeIds.length > 0) {
        locales = locales.filter(({ id }) => localeIds.includes(id))
    }
    // Fetch strings and shove into the locale
    // TODO: we should be able to do that directly using the graphql API,
    // the whole point being to avoid this kind of cascading fetches
    for (const locale of locales) {
        let localeStrings: Array<Translation> = []
        for (const context of contexts) {
            const { data: strings, error } = await getLocaleContextStrings({
                locale,
                context
            })
            if (error) throw error
            if (!strings) throw new Error('No strings for locale ' + locale.id)
            localeStrings = [...localeStrings, ...strings]
        }
        // @ts-ignore
        locale.strings = localeStrings
    }
    logToFile('localesResultsRedis.json', locales)
    // @ts-ignore inference is bad...
    return locales
}
