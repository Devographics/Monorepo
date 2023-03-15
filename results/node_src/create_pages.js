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
const { getMetadataQuery, getDefaultQuery } = require('./queries.js')
const { getLocalesRedis } = require('./locales.js')

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

exports.createPagesSingleLoop = async ({ graphql, actions: { createPage, createRedirect } }) => {
    const surveyId = process.env.SURVEYID
    const editionId = process.env.EDITIONID

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

    const metadataQuery = getMetadataQuery({ surveyId, editionId })
    const metadataResults = await graphql(
        `
            ${metadataQuery}
        `
    )
    const metadataData = metadataResults?.data?.dataAPI
    const metadata = []
    const currentSurvey = metadataData[surveyId]._metadata
    const currentEdition = metadataData[surveyId][editionId]._metadata

    const chartSponsors = await getSendOwlData({ flat, config })

    for (const page of flat) {
        let pageData = {}
        const context = getPageContext(page)

        try {
            // pageData = await runPageQuery({ page, graphql })
            pageData = await runPageQueries({ page, graphql, surveyId, editionId })
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
