const { computeSitemap } = require('./sitemap.js')
const {
    getPageContext,
    getLocalizedPath,
    getCleanLocales,
    createBlockPages,
    runPageQueries,
} = require('./helpers.js')
const { getSendOwlData } = require('./sendowl.js')
const yaml = require('js-yaml')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const { logToFile } = require('./log_to_file.js')

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

const getLocalesQuery = (localeIds, contexts) => {
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
            strings {
                key
                t
                tHtml
                context
                isFallback
            }
            translators
        }
    }
}
`
}

exports.createPagesSingleLoop = async ({ graphql, actions: { createPage, createRedirect } }) => {
    const buildInfo = {
        USE_FAST_BUILD,
        localeCount: 0,
        pages: [],
        pageCount: 0,
        blocks: [],
        blockCount: 0,
        translationContexts: config.translationContexts
    }

    console.log(`// Building ${process.env.SURVEY}…`)

    // if USE_FAST_BUILD is turned on only keep en-US and ru-RU locale to make build faster
    const localeIds = USE_FAST_BUILD ? ['en-US', 'ru-RU'] : []

    const localesQuery = getLocalesQuery(localeIds, config.translationContexts)
    logToFile('localesQuery.graphql', localesQuery, {
        mode: 'overwrite',
        surveyId: config.surveyId
    })

    const localesResults = await graphql(
        `
            ${localesQuery}
        `
    )
    logToFile('localesResults.json', localesResults, {
        mode: 'overwrite',
        surveyId: config.surveyId
    })

    const locales = localesResults.data.internalAPI.locales

    buildInfo.localeCount = locales.length

    const cleanLocales = getCleanLocales(locales)
    logToFile('locales.json', cleanLocales, { mode: 'overwrite' })
    locales.forEach(locale => {
        logToFile(`${locale.id}.json`, locale, {
            mode: 'overwrite',
            subDir: 'locales',
            surveyId: config.surveyId
        })
    })

    const { flat } = await computeSitemap(rawSitemap, cleanLocales)

    logToFile(
        'flat_sitemap.yml',
        yaml.dump({ locales: cleanLocales, contents: flat }, { noRefs: true }),
        { mode: 'overwrite', surveyId: config.surveyId }
    )

    const chartSponsors = USE_FAST_BUILD ? {} : await getSendOwlData({ flat, config })

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
                    locales: cleanLocales,
                    locale,
                    chartSponsors,
                    pageData,
                    config
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
            // createBlockPages(page, context, createPage, locales, buildInfo)
        }
    }
    logToFile('build.yml', yaml.dump(buildInfo, { noRefs: true }), {
        mode: 'overwrite',
        surveyId: config.surveyId
    })
}
