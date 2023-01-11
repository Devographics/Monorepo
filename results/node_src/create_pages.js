const { computeSitemap } = require('./sitemap.js')
const {
    getPageContext,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQueries
} = require('./helpers.js')
const { getSendOwlData } = require('./sendowl.js')
const yaml = require('js-yaml')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const { logToFile } = require('./log_to_file.js')
const { createClient } = require('redis')

const USE_FAST_BUILD = process.env.FAST_BUILD === 'true'

const rawSitemap = yaml.load(
    fs.readFileSync(
        path.resolve(__dirname, `../surveys/${process.env.SURVEY}/config/raw_sitemap.yml`),
        'utf8'
    )
)
const config = {
    ...yaml.load(
        fs.readFileSync(
            path.resolve(__dirname, `../surveys/${process.env.SURVEY}/config/config.yml`),
            'utf8'
        )
    ),
    surveyId: process.env.SURVEY
}

const getLocalesQuery = (localeIds, contexts, loadStrings = true) => {
    const args = []
    if (localeIds.length > 0) {
        args.push(`localeIds: [${localeIds.map(id => `"${id}"`).join(',')}]`)
    }
    if (contexts.length > 0) {
        args.push(`contexts: [${contexts.join(', ')}]`)
    }

    const argumentsString = args.length > 0 ? `(${args.join(', ')})` : ''

    return `
query {
    internalAPI {
        locales${argumentsString} {
            completion
            id
            label
            ${
                loadStrings
                    ? `strings {
                key
                t
                tHtml
                tClean
                context
                isFallback
            }`
                    : ''
            }
            translators
        }
    }
}
`
}

const getAllSurveysQuery = () => {
    return `
query {
    dataAPI {
        metadata
        allSurveys {
            name
            slug
            editions {
                surveyId
                year
                faviconUrl
                socialImageUrl
                colors {
                    primary
                    secondary
                    text
                    background
                    backgroundSecondary
                }
                endedAt
                imageUrl
                questionsUrl
                resultsUrl
                startedAt
                status
                tags
            }
            domain
            hashtag
            emailOctopus {
                listId
            }
        }
    }
}`
}

const getLocalesGraphQL = async ({ localeIds, graphql, contexts, surveyId }) => {

    const localesQuery = getLocalesQuery(localeIds, contexts)
    logToFile('localesQuery.graphql', localesQuery, {
        mode: 'overwrite',
        surveyId
    })

    const localesResults = await graphql(
        `
            ${localesQuery}
        `
    )
    logToFile('localesResults.json', localesResults, {
        mode: 'overwrite',
        surveyId
    })
    const locales = localesResults.data.internalAPI.locales

    return locales
}

const getLocalesRedis = async ({ localeIds, contexts, surveyId }) => {
    const redisClient = createClient({
        url: process.env.REDIS_URL
    })

    redisClient.on('error', err => console.log('Redis Client Error', err))

    await redisClient.connect()

    const localesRaw = await redisClient.get('locale_all_locales_metadata')
    let locales = JSON.parse(localesRaw)

    if (localeIds && localeIds.length > 0) {
        locales = locales.filter(({ id }) => localeIds.includes(id))
    }

    logToFile('localesMetadataRedis.json', locales, {
        mode: 'overwrite',
        surveyId
    })

    for (const locale of locales) {
        let localeStrings = []

        for (const context of contexts) {
            const key = `locale_${locale.id}_${context}_parsed`
            const dataRaw = await redisClient.get(key)
            const data = JSON.parse(dataRaw)
            const strings = data.strings
            localeStrings = [...localeStrings, ...strings]
        }
        locale.strings = localeStrings
    }

    logToFile('localesResultsRedis.json', locales, {
        mode: 'overwrite',
        surveyId
    })

    return locales
}

exports.createPagesSingleLoop = async ({ graphql, actions: { createPage, createRedirect } }) => {
    const surveyId = process.env.SURVEY

    const buildInfo = {
        USE_FAST_BUILD,
        localeCount: 0,
        pages: [],
        pageCount: 0,
        blocks: [],
        blockCount: 0,
        translationContexts: config.translationContexts
    }

    console.log(`// Building ${process.env.SURVEY}… (USE_FAST_BUILD = ${USE_FAST_BUILD})`)

    // if USE_FAST_BUILD is turned on only keep en-US and ru-RU locale to make build faster
    const localeIds = USE_FAST_BUILD ? ['en-US', 'ru-RU'] : []

    /* 
    
    1. GraphQL version: one huge slow query

    */

    // const locales = await getLocalesGraphQL({
    //     graphql,
    //     localeIds,
    //     contexts: config.translationContexts,
    //     surveyId
    // })

    /*
    
    2. Redis version: many small fast queries (without null fields)

    */
    const locales = await getLocalesRedis({
        localeIds,
        contexts: config.translationContexts,
        surveyId
    })


    buildInfo.localeCount = locales.length

    const cleanLocales = getCleanLocales(locales)
    logToFile('locales.json', cleanLocales, { mode: 'overwrite', surveyId })
    locales.forEach(locale => {
        logToFile(`${locale.id}.json`, locale, {
            mode: 'overwrite',
            subDir: 'locales',
            surveyId
        })
    })

    const { flat } = await computeSitemap(rawSitemap, cleanLocales)

    const flatSitemap = { locales: cleanLocales, contents: flat }
    logToFile('flat_sitemap.yml', yaml.dump(flatSitemap, { noRefs: true }), {
        mode: 'overwrite',
        surveyId
    })

    const allSurveysQuery = getAllSurveysQuery()
    const allSurveysResults = await graphql(
        `
            ${allSurveysQuery}
        `
    )
    const allSurveys = allSurveysResults.data.dataAPI.allSurveys
    const metadata = allSurveysResults.data.dataAPI.metadata
    const currentSurvey = allSurveys.find(s => s.editions.some(e => e.surveyId === surveyId))
    const currentEdition = currentSurvey.editions.find(e => e.surveyId === surveyId)

    const chartSponsors = await getSendOwlData({ flat, config })

    for (const page of flat) {
        let pageData = {}
        const context = getPageContext(page)

        try {
            // pageData = await runPageQuery({ page, graphql })
            pageData = await runPageQueries({ page, graphql, config })
        } catch (error) {
            console.log(`// GraphQL error for page ${page.id}`)
            console.log(page)
            throw error
        }

        // loop over locales
        for (let index = 0; index < locales.length; index++) {
            buildInfo.pageCount++

            const locale = locales[index]
            locale.path = `/${locale.id}`

            const pageObject = {
                path: getLocalizedPath(page.path, locale),
                component: path.resolve(`./src/core/pages/PageTemplate.js`),
                context: {
                    ...context,
                    metadata,
                    locales: cleanLocales,
                    locale,
                    localeId: locale.id,
                    localeContexts: config.translationContexts,
                    chartSponsors,
                    pageData,
                    surveyId,
                    config,
                    currentSurvey,
                    currentEdition
                }
            }

            if (page.id === 'notfound') {
                pageObject.matchPath = `/${locale.id}/*`
            }

            createPage(pageObject)
        }

        // also redirect "naked" paths (whithout a locale) to en-US
        createRedirect({
            fromPath: getLocalizedPath(page.path, null),
            toPath: getLocalizedPath(page.path, { id: 'en-US' }),
            isPermanent: true
        })

        if (!USE_FAST_BUILD) {
            // skip this is fast_build option is enabled
            createBlockPages(page, context, createPage, locales, buildInfo)
        }
    }
    logToFile('build.yml', yaml.dump(buildInfo, { noRefs: true }), {
        mode: 'overwrite',
        surveyId
    })
}
