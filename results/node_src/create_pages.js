const { computeSitemap } = require('./sitemap.js')
const {
    logToFile,
    getPageContext,
    getPageQuery,
    wrapWithQuery,
    cleanIdString,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages
} = require('./helpers.js')
const yaml = require('js-yaml')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')

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
    const localesResults = await graphql(
        `
            ${localesQuery}
        `
    )
    let locales = localesResults.data.surveyApi.locales

    if (Boolean(process.env.FAST_BUILD) === true) {
        // if locales are turned off (to make build faster), only keep en-US locale
        locales = localesResults.data.surveyApi.locales.filter(l => l.id === 'en-US')
    }

    const cleanLocales = getCleanLocales(locales)
    logToFile('locales.json', cleanLocales, { mode: 'overwrite' })
    locales.forEach(locale => {
        logToFile(`locales/${locale.id}.json`, locale, { mode: 'overwrite' })
    })

    const { flat } = await computeSitemap(rawSitemap, cleanLocales)

    for (const page of flat) {
        let pageData = {}
        const context = getPageContext(page)
        const pageQuery = getPageQuery(page)

        logToFile('queries.txt', '', { mode: 'overwrite' })

        try {
            if (pageQuery) {
                const queryName = _.upperFirst(cleanIdString(page.id))
                const wrappedPageQuery = wrapWithQuery(`page${queryName}Query`, pageQuery)
                logToFile('queries.txt', wrappedPageQuery, { mode: 'append' })
                const start = new Date()
                const queryResults = await graphql(
                    `
                        ${wrappedPageQuery}
                    `
                )
                const end = new Date()
                const timeDiff = Math.round((end - start) / 1000)
                pageData = queryResults.data
                logToFile(
                    `data/${queryName}.json`,
                    { data: pageData, duration: timeDiff },
                    { mode: 'overwrite' }
                )
            }
        } catch (error) {
            console.log(`// Error while loading data for page ${page.id}`)
            logToFile('errorQueries.txt', pageQuery, { mode: 'append' })
            console.log(pageQuery)
            console.log(error)
        }

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

        if (Boolean(!process.env.FAST_BUILD) === true) {
            // skip this is fast_build option is enabled
            createBlockPages(page, context, createPage, locales)
        }
    }
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

    logToFile('locales.json', cleanLocales, { mode: 'overwrite' })

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
