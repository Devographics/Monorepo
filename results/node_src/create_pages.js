const { computeSitemap } = require('./sitemap.js')
const {
    logToFile,
    getPageContext,
    getPageQuery,
    wrapWithQuery,
    cleanIdString,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQuery
} = require('./helpers.js')
const yaml = require('js-yaml')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')

const USE_FAST_BUILD = process.env.FAST_BUILD === 'true'

const rawSitemap = yaml.load(
    fs.readFileSync(
        path.resolve(__dirname, `../surveys/${process.env.SURVEY}/config/raw_sitemap.yml`),
        'utf8'
    )
)
const config = yaml.load(
    fs.readFileSync(
        path.resolve(__dirname, `../surveys/${process.env.SURVEY}/config/config.yml`),
        'utf8'
    )
)

const localesQuery = `
query {
    surveyApi {
        locales(contexts: [${config.translationContexts.join(', ')}]) {
            completion
            id
            label
            strings {
                key
                t
                tHtml
                context
                fallback
            }
            translators
        }
    }
}
`

// v1. single loop, run graphql queries and create pages in the same loop
exports.createPagesSingleLoop = async ({ graphql, actions: { createPage, createRedirect } }) => {
    const buildInfo = {
        USE_FAST_BUILD,
        localeCount: 0,
        pages: [],
        pageCount: 0,
        blocks: [],
        blockCount: 0
    }
    const localesResults = await graphql(
        `
            ${localesQuery}
        `
    )
    let locales = localesResults.data.surveyApi.locales

    buildInfo.localeCount = locales.length

    if (USE_FAST_BUILD) {
        // if locales are turned off (to make build faster), only keep en-US locale
        locales = localesResults.data.surveyApi.locales.filter(l =>
            ['en-US', 'ru-RU'].includes(l.id)
        )
    }

    const cleanLocales = getCleanLocales(locales)
    logToFile('locales.json', cleanLocales, { mode: 'overwrite' })
    locales.forEach(locale => {
        logToFile(`${locale.id}.json`, locale, { mode: 'overwrite', subDir: 'locales' })
    })

    const { flat } = await computeSitemap(rawSitemap, cleanLocales)

    logToFile(
        'flat_sitemap.yml',
        yaml.dump({ locales: cleanLocales, contents: flat }, { noRefs: true }),
        { mode: 'overwrite' }
    )

    for (const page of flat) {
        let pageData = {}
        const context = getPageContext(page)
        const pageQuery = getPageQuery(page)

        logToFile('queries.txt', '', { mode: 'overwrite' })

        pageData = await runPageQuery({ page, graphql })

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
                    locales: cleanLocales,
                    locale,
                    pageData,
                    pageQuery // passed for debugging purposes
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
    logToFile('build.yml', yaml.dump(buildInfo, { noRefs: true }), { mode: 'overwrite' })
}

// v2. two loops, one for batching all queries together and one for creating pages
exports.createPagesTwoLoops = async ({ graphql, actions: { createPage, createRedirect } }) => {
    let allQueries = ''

    const localesResults = await graphql(
        `
            ${localesQuery}
        `
    )
    const locales = localesResults.data.surveyApi.locales
    const cleanLocales = getCleanLocales(locales)

    const { flat } = await computeSitemap(rawSitemap, cleanLocales)

    logToFile(
        'flat_sitemap.yml',
        yaml.dump({ locales: cleanLocales, contents: flat }, { noRefs: true }),
        { mode: 'overwrite' }
    )

    // first loop: aggregate all page queries together
    for (const page of flat) {
        const pageQuery = getPageQuery(page)
        if (pageQuery) {
            allQueries += pageQuery + `\n\n`
        }
    }

    allQueries = wrapWithQuery('megaSurveyQuery', allQueries)
    logToFile('queries.txt', allQueries, { mode: 'overwrite' })
    const allQueriesResults = await graphql(
        `
            ${allQueries}
        `
    )
    const allPageData = allQueriesResults.data

    logToFile('allQueriesResults.txt', allQueriesResults)

    // second loop: create pages
    for (const page of flat) {
        const context = getPageContext(page)

        // loop over locales
        for (let index = 0; index < locales.length; index++) {
            const locale = locales[index]
            locale.path = `/${locale.id}`

            const pageObject = {
                path: getLocalizedPath(page.path, locale),
                component: path.resolve(`./src/core/pages/PageTemplate.js`),
                context: {
                    ...context,
                    locales: cleanLocales,
                    locale,
                    pageData: allPageData
                }
            }
            createPage(pageObject)
        }

        // also redirect "naked" paths (whithout a locale) to en-US
        createRedirect({
            fromPath: getLocalizedPath(page.path, null),
            toPath: getLocalizedPath(page.path, { id: 'en-US' }),
            isPermanent: true
        })

        createBlockPages(page, context, createPage, locales)
    }
}
