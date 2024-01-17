// TODO: share this data fetching logic with surveyform
import { getLocalesQuery, getLocaleContextQuery } from './queries'
import { logToFile } from './log_to_file'
import { getRedisClient } from './redis'
import { getCachingMethods, removeNull } from './helpers'
import { Locale, Translation } from '@devographics/react-i18n'

const getAllLocalesCacheKey = () => `${process.env.APP_NAME}__allLocales__metadata`
const getLocaleContextCacheKey = (localeId, context) =>
    `${process.env.APP_NAME}__locale__${localeId}__${context}__parsed`

export const getLocalesGraphQL = async ({ graphql, contexts, key }) => {
    const localesQuery = getLocalesQuery(contexts, false)
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
 * @typedef {{
 *      // languages we want to get
 *      // if empty or undefined
 *      localeIds?: Array<string>,
 *      graphql: any,
 *      // specific i18n contexts we want to get
 *      contexts: Array<string>
 * }} Foo
 */
/**
 * 
 * @param {Object} config
 * @param {Array<string> | undefined} config.localeIds - the languages to be fetched, if empty will get all languages
 * @param {(query: string) => Promise<any>} graphql - A fetcher function to get data, based on a graphql query
 * @param {Array<string>} contexts - the specific translation strings to be fetched
 * @returns {Promise<Array<Locale>>} Locales with strings
 */
export const getLocales = async ({ localeIds, graphql, contexts }) => {
    let locales: Array<Locale>
    const redisClient = getRedisClient()
    const allLocalesKey = getAllLocalesCacheKey()
    const useRedisCache = getCachingMethods().redis
    const localesRaw = useRedisCache && (await redisClient.get(allLocalesKey))
    if (localesRaw) {
        locales = localesRaw
    } else {
        if (useRedisCache) {
            console.log(`🌐 Redis key ${allLocalesKey} was empty, fetching from API…`)
        } else {
            console.log(`🌐 Redis cache disabled, fetching ${allLocalesKey} from API…`)
        }
        locales = await getLocalesGraphQL({ graphql, contexts, key: allLocalesKey })
        await redisClient.set(allLocalesKey, locales)
    }

    if (localeIds && localeIds.length > 0) {
        locales = locales.filter(({ id }) => localeIds.includes(id))
    }

    logToFile('localesMetadataRedis.json', locales)

    for (const locale of locales) {
        let localeStrings: Array<Translation> = []

        for (const context of contexts) {
            const key = getLocaleContextCacheKey(locale.id, context)
            const dataRaw = useRedisCache && (await redisClient.get(key))
            let strings
            if (dataRaw) {
                const data = dataRaw
                strings = data.strings
            } else {
                if (useRedisCache) {
                    console.log(`🌐 Redis key ${key} was empty, fetching from API…`)
                } else {
                    console.log(`🌐 Redis cache disabled, fetching ${key} from API…`)
                }
                const data = await getLocaleContextGraphQL({
                    localeId: locale.id,
                    context,
                    graphql,
                    key
                })
                strings = data.strings
                await redisClient.set(key, data)
            }
            localeStrings = [...localeStrings, ...strings]
        }
        locale.strings = localeStrings
    }

    logToFile('localesResultsRedis.json', locales)

    return locales
}
