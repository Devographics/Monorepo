import { computeSitemap } from './sitemap.mjs'
import {
    getPageContext,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQueries
} from './helpers.mjs'
import { getSendOwlData } from './sendowl.mjs'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { logToFile } from './log_to_file.mjs'
import { getMetadataQuery } from './queries.mjs'
import { getLocalesRedis } from './locales.mjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const USE_FAST_BUILD = process.env.FAST_BUILD === 'true'

const rawSitemap = yaml.load(
    fs.readFileSync(
        path.resolve(__dirname, `../surveys/${process.env.EDITIONID}/config/raw_sitemap.yml`),
        'utf8'
    )
)
const config = {
    ...yaml.load(
        fs.readFileSync(
            path.resolve(__dirname, `../surveys/${process.env.EDITIONID}/config/config.yml`),
            'utf8'
        )
    ),
    editionId: process.env.EDITIONID
}

export const createPagesSingleLoop = async ({
    graphql,
    actions: { createPage, createRedirect }
}) => {
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

    console.log(`// Building ${surveyId}/${editionId}… (USE_FAST_BUILD = ${USE_FAST_BUILD})`)

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
        editionId
    })

    buildInfo.localeCount = locales.length

    const cleanLocales = getCleanLocales(locales)
    logToFile('locales.json', cleanLocales, { mode: 'overwrite', surveyId })
    locales.forEach(locale => {
        logToFile(`${locale.id}.json`, locale, {
            mode: 'overwrite',
            subDir: 'locales',
            editionId
        })
    })

    const { flat } = await computeSitemap(rawSitemap, cleanLocales)

    const flatSitemap = { locales: cleanLocales, contents: flat }
    logToFile('flat_sitemap.yml', yaml.dump(flatSitemap, { noRefs: true }), {
        mode: 'overwrite',
        editionId
    })

    const metadataQuery = getMetadataQuery({ surveyId, editionId })

    logToFile('metadataQuery.graphql', metadataQuery, {
        mode: 'overwrite',
        editionId
    })

    const metadataResults = await graphql(
        `
            ${metadataQuery}
        `
    )
    const metadataData = metadataResults?.data?.dataAPI
    logToFile('metadataData.json', metadataData, {
        mode: 'overwrite',
        editionId
    })
    const metadata = []
    const currentSurvey = metadataData.surveys[surveyId]._metadata
    const currentEdition = metadataData.surveys[surveyId][editionId]._metadata

    const siteUrl = currentEdition.results_url
    const chartSponsors = await getSendOwlData({ flat, surveyId, editionId, siteUrl })

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
        editionId
    })
}
