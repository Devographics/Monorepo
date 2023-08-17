import { getLocalesQuery, getLocaleContextQuery } from './queries.mjs'
import { logToFile } from './log_to_file.mjs'
import { getRedisClient } from './redis.mjs'
import { removeNull } from './helpers.mjs'

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

export const getLocales = async ({ localeIds, graphql, contexts }) => {
    let locales
    const redisClient = getRedisClient()
    const allLocalesKey = getAllLocalesCacheKey()
    const localesRaw = await redisClient.get(allLocalesKey)
    if (localesRaw) {
        locales = localesRaw
    } else {
        console.log(`Redis key ${allLocalesKey} was empty, fetching from API…`)
        locales = await getLocalesGraphQL({ graphql, contexts, key: allLocalesKey })
        await redisClient.set(allLocalesKey, locales)
    }

    if (localeIds && localeIds.length > 0) {
        locales = locales.filter(({ id }) => localeIds.includes(id))
    }

    logToFile('localesMetadataRedis.json', locales)

    for (const locale of locales) {
        let localeStrings = []

        for (const context of contexts) {
            const key = getLocaleContextCacheKey(locale.id, context)
            const dataRaw = await redisClient.get(key)
            let strings
            if (dataRaw) {
                const data = dataRaw
                strings = data.strings
            } else {
                console.log(`Redis key ${key} was empty, fetching from API…`)
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
