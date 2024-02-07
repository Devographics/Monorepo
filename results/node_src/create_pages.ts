import type { CreatePagesArgs, Page } from "gatsby"
import { computeSitemap } from './sitemap'
import {
    getPageContext,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQueries,
    getLoadMethod,
    getMetadata
} from './helpers'
import { getSendOwlData } from './sendowl'
// @ts-ignore
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { logToFile } from './log_to_file'
import { initRedis } from './redis'
import { getLocalesWithStrings } from "@devographics/react-i18n/server"
import { allowedCachingMethods } from "@devographics/fetch"
import type { PageContextValue } from '../src/core/types/context'
import type { SponsorProduct } from "../src/core/types/sponsors"

//  Not needed in TS/ recent versions of node
// import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
const editionFolder = path.resolve(__dirname, `../surveys/${process.env.EDITIONID}`)

function checkConfig() {
    const errors: Array<string> = []
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
const GENERATE_BLOCKS = process.env.GATSBY_GENERATE_BLOCKS === 'true'

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
}: CreatePagesArgs) => {
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

    const cachingMethods = allowedCachingMethods()
    const cachingMethodsString = Object.keys(cachingMethods)
        .map(cm => (cachingMethods[cm] ? cm : strikeThrough(cm)))
        .join(', ')

    // if USE_FAST_BUILD is turned on only keep en-US and ru-RU locale to make build faster
    const localeIds = USE_FAST_BUILD ? ['en-US', 'ru-RU'] : []

    const appConfig = process.env.CONFIG ? process.env.CONFIG : 'default'

    console.log(
        `---------------------------------------------------------------
• 📄 config = ${appConfig}
• 📊 edition = ${surveyId}/${editionId}
• 📡 apiUrl = ${process.env.GATSBY_API_URL}
• 📁 caching methods = ${cachingMethodsString}
• ⏱️ fast build = ${USE_FAST_BUILD}
• 📖 load method = ${getLoadMethod()}
• 🌐 locales = ${localeIds.length > 0 ? localeIds.join(', ') : 'all'}`
    )

    // load metadata
    const { currentSurvey, currentEdition } = await getMetadata({ surveyId, editionId, graphql })
    const { enableChartSponsorships, resultsUrl } = currentEdition
    const metadata = []

    console.log(
        `• 💰 chart sponsorships = ${enableChartSponsorships ? 'enabled' : 'disabled'}
----------------------------------------------------------------`
    )

    // loading i18n data

    const locales = await getLocalesWithStrings({
        localeIds,
        graphql,
        contexts: config.translationContexts,
        //editionId
    })

    buildInfo.localeCount = locales.length

    const cleanLocales = getCleanLocales(locales)
    logToFile('locales.json', cleanLocales, { mode: 'overwrite'/*,surveyId*/ })
    locales.forEach(locale => {
        logToFile(`${locale.id}.json`, locale, {
            mode: 'overwrite',
            subDir: 'locales',
            //editionId
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
        //editionId
    })

    const siteUrl = resultsUrl

    let chartSponsors: Array<SponsorProduct> = []
    if (!USE_FAST_BUILD && enableChartSponsorships) {
        chartSponsors = await getSendOwlData({ flat, surveyId, editionId, siteUrl })
    }

    // Building page context for each page of the sitemap

    // @ts-
    const allBlocks = flat.map(page => page.blocks).flat()
    const allVariants = allBlocks.map(block => block?.variants).flat()
    const i18nNamespaces = {}
    for (const variant of allVariants) {
        if (variant.i18nNamespace) {
            i18nNamespaces[variant.id] = variant.i18nNamespace
        }
    }

    for (const page of flat) {
        console.log('// Building page ' + page.path)
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
            const localePath = `/${locale.id}`

            const pageObject: Page<PageContextValue> = {
                path: getLocalizedPath(page.path, locale),
                component: path.resolve(`./src/core/pages/PageTemplate.tsx`),
                context: {
                    ...fullContext,
                    pageData,
                    locale,
                    localePath,
                    localeId: locale.id,
                    i18nNamespaces
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

        if (GENERATE_BLOCKS) {
            // skip this is fast_build option is enabled
            createBlockPages(page, fullContext, createPage, locales, buildInfo)
        }
    }
    logToFile('build.yml', yaml.dump(buildInfo, { noRefs: true }), {
        mode: 'overwrite',
        //editionId
    })
}
