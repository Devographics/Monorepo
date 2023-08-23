import { computeSitemap } from './sitemap.mjs'
import {
    getPageContext,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQueries,
    getLoadMethod,
    removeNull,
    getCachingMethods
} from './helpers.mjs'
import { getSendOwlData } from './sendowl.mjs'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { logToFile } from './log_to_file.mjs'
import { getMetadataQuery } from './queries.mjs'
import { getLocales } from './locales.mjs'
import { fileURLToPath } from 'url'
import { initRedis } from './redis.mjs'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const editionFolder = path.resolve(__dirname, `../surveys/${process.env.EDITIONID}`)

function checkConfig() {
    const errors = []
    if (!process.env.EDITIONID) errors.push('EDITIONID not defined')
    if (!process.env.SURVEYID) errors.push('SURVEYID not defined')
    if (!fs.existsSync(editionFolder)) {
        errors.push(`Folder ${editionFolder} doesn't exist, this is not a valid survey edition.`)
    }
    if (errors.length) {
        throw new Error(errors.join('\n'))
    }
}
checkConfig()

const USE_FAST_BUILD = process.env.FAST_BUILD === 'true'

const rawSitemap = yaml.load(
    fs.readFileSync(path.join(editionFolder, 'config/raw_sitemap.yml'), 'utf8')
)
const config = {
    ...yaml.load(fs.readFileSync(path.join(editionFolder, 'config/config.yml'), 'utf8')),
    editionId: process.env.EDITIONID
}

function strikeThrough(text) {
    return text
        .split('')
        .map(char => char + '\u0336')
        .join('')
}

/**
 * @see createPages https://www.gatsbyjs.com/docs/how-to/querying-data/using-gatsby-without-graphql/#the-approach-fetch-data-and-use-gatsbys-createpages-api
 */
export const createPagesSingleLoop = async ({
    graphql,
    /**
     * @see https://www.gatsbyjs.com/docs/reference/config-files/actions/#createPage
     */
    actions: { createPage, createRedirect }
}) => {
    await initRedis()

    const surveyId = process.env.SURVEYID
    if (!surveyId) throw new Error(`Must provide "SURVEYID" env variable`)
    const editionId = process.env.EDITIONID
    if (!editionId) throw new Error(`Must provide "EDITIONID" env variable`)

    const buildInfo = {
        USE_FAST_BUILD,
        localeCount: 0,
        pages: [],
        pageCount: 0,
        blocks: [],
        blockCount: 0,
        translationContexts: config.translationContexts
    }

    const cachingMethods = getCachingMethods()
    const cachingMethodsString = Object.keys(cachingMethods)
        .map(cm => (cachingMethods[cm] ? cm : strikeThrough(cm)))
        .join(', ')

    console.log(
        `Building ${surveyId}/${editionId}… 
• 📁 caching methods = ${cachingMethodsString}
• ⏱️ fast build = ${USE_FAST_BUILD}
• 📖 load method = ${getLoadMethod()}`
    )

    // loading i18n data

    // if USE_FAST_BUILD is turned on only keep en-US and ru-RU locale to make build faster
    const localeIds = USE_FAST_BUILD ? ['en-US', 'ru-RU'] : []

    const locales = await getLocales({
        localeIds,
        graphql,
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

    // loading edition specific data 

    const editionVariables = {
        surveyId,
        editionId
    }

    const { flat } = await computeSitemap(rawSitemap, editionVariables)

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

    const metadataResults = removeNull(
        await graphql(
            `
                ${metadataQuery}
            `
        )
    )
    const metadataData = metadataResults?.data?.dataAPI
    logToFile('metadataData.json', metadataData, {
        mode: 'overwrite',
        editionId
    })
    const metadata = []
    const currentSurvey = metadataData.surveys[surveyId]._metadata
    const currentEdition = metadataData.surveys[surveyId][editionId]._metadata

    const siteUrl = currentEdition.resultsUrl

    let chartSponsors = []
    if (!USE_FAST_BUILD) {
        chartSponsors = await getSendOwlData({ flat, surveyId, editionId, siteUrl })
    }

    // Building page context for each page of the sitemap

    for (const page of flat) {
        console.log("// Building page " + page.path)
        let pageData = {}
        const context = getPageContext(page)

        const fullContext = {
            ...context,
            metadata,
            locales: cleanLocales,
            localeContexts: config.translationContexts,
            chartSponsors,
            surveyId,
            config,
            currentSurvey,
            currentEdition
        }

        try {
            // pageData = await runPageQuery({ page, graphql })
            pageData = await runPageQueries({ page, graphql, surveyId, editionId, currentEdition })
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
                    ...fullContext,
                    pageData,
                    locale,
                    localeId: locale.id
                }
            }

            if (page.id === 'notfound') {
                pageObject.matchPath = `/${locale.id}/*`
            }

            createPage(pageObject)
        }

        // also redirect "naked" paths (whithout a locale) to en-US
        // TODO: this doesn't seem to work during development
        createRedirect({
            fromPath: getLocalizedPath(page.path, null),
            toPath: getLocalizedPath(page.path, { id: 'en-US' }),
            isPermanent: true
        })

        if (!USE_FAST_BUILD) {
            // skip this is fast_build option is enabled
            // createBlockPages(page, fullContext, createPage, locales, buildInfo)
        }
    }
    logToFile('build.yml', yaml.dump(buildInfo, { noRefs: true }), {
        mode: 'overwrite',
        editionId
    })
}
