const { omit } = require('lodash')
const { indentString } = require('./indent_string.js')
// const indentString = require('indent-string')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const yaml = require('js-yaml')
const { TwitterApi } = require('twitter-api-v2')
const { logToFile } = require('./log_to_file.js')

const fsPromises = fs.promises
/*

Get the localized version of a page path

*/
const getLocalizedPath = (path, locale) => (locale ? `/${locale.id}${path}` : path)
exports.getLocalizedPath = getLocalizedPath

/*

Get locales without the strings, to avoid loading every locale's dictionnary in memory

Also add paths

*/
const getCleanLocales = locales => locales.map(l => ({ path: `/${l.id}`, ...omit(l, ['strings']) }))
exports.getCleanLocales = getCleanLocales

/*

Get a page's context

*/
exports.getPageContext = page => {
    const context = omit(page, ['path', 'children'])
    context.basePath = page.path

    return {
        ...context,
        ...page.data
    }
}

/*

Clean ID string

*/
exports.cleanIdString = id => id.replace(new RegExp('-', 'g'), '_')

/*

Wrap query contents with query FooQuery {...}

*/
exports.wrapWithQuery = (queryName, queryContents) => `query ${queryName} {
  ${indentString(queryContents, 4)}
  }`

/*

Load a template yml file

*/
exports.loadTemplate = async name => {
    const templatePath = `${path.join(__dirname, '../')}src/templates/${name}.yml`
    try {
        const data = await fsPromises.readFile(templatePath, 'utf8')
        const yamlData = yaml.load(data)
        yamlData.name = name
        return yamlData
    } catch (error) {
        console.log(`// Error loading template ${name}`)
        console.log(error)
    }
}

/*

Create individual pages for each block (for social media meta tags)

*/
exports.createBlockPages = (page, context, createPage, locales, buildInfo) => {
    const blocks = page.blocks
    if (!Array.isArray(blocks) || blocks.length === 0) {
        return
    }

    blocks.forEach(block => {
        if (!block.disableExport) {
            block.variants.forEach(blockVariant => {
                // allow for specifying explicit pageId in block definition
                if (!blockVariant.pageId) {
                    blockVariant.pageId = page.id
                }
                locales.forEach(locale => {
                    buildInfo.blockCount++

                    const blockPage = {
                        path: getLocalizedPath(blockVariant.path, locale),
                        component: path.resolve(`./src/core/share/ShareBlockTemplate.js`),
                        context: {
                            ...context,
                            redirect: `${getLocalizedPath(page.path, locale)}#${blockVariant.id}`,
                            block: blockVariant,
                            locales: getCleanLocales(locales),
                            locale
                        }
                    }
                    createPage(blockPage)
                })
            })
        }
    })
}

/*

Get a file from the disk or from GitHub

*/
exports.getExistingData = async ({ dataFileName, dataFilePath, baseUrl }) => {
    let contents, data
    if (process.env.JSON_CACHE_TYPE === 'local') {
        if (fs.existsSync(dataFilePath)) {
            console.log(`// 🎯 File ${dataFileName} found on disk, loading its contents…`)
            contents = fs.readFileSync(dataFilePath, 'utf8')
        }
    } else {
        const response = await fetch(`${baseUrl}/data/${dataFileName}`)
        contents = await response.text()
        if (contents) {
            console.log(`// 🎯 File ${dataFileName} found on GitHub, loading its contents…`)
        }
    }
    try {
        data = JSON.parse(contents)
    } catch (error) {
        return
    }
    return data
}

exports.getConfigLocations = config => ({
    localPath: `./../../devographics-surveys/${config.slug}/${config.year}`,
    url: `https://devographics.github.io/surveys/${config.slug}/${config.year}`
})

/*

Try loading data from disk or GitHub, or else run queries for *each block* in a page

*/
exports.runPageQueries = async ({ page, graphql, config }) => {
    const startedAt = new Date()
    console.log(`// Running GraphQL queries for page ${page.id}…`)

    const paths = exports.getConfigLocations(config)
    const basePath = paths.localPath + '/results'
    const baseUrl = paths.url + '/results'

    let pageData = {}

    for (const b of page.blocks) {
        for (const v of b.variants) {
            if (v.query) {
                let data

                const dataDirPath = path.resolve(`${basePath}/data`)
                const dataFileName = `${v.id}.json`
                const dataFilePath = `${dataDirPath}/${dataFileName}`
                const queryDirPath = path.resolve(`${basePath}/queries`)
                const queryFileName = `${v.id}.graphql`
                const queryFilePath = `${queryDirPath}/${queryFileName}`

                const existingData = await exports.getExistingData({
                    dataFileName,
                    dataFilePath,
                    baseUrl
                })
                if (existingData) {
                    data = existingData
                } else {
                    logToFile(queryFileName, v.query.replace('dataAPI', 'query'), {
                        mode: 'overwrite',
                        dirPath: queryDirPath
                    })

                    const queryName = _.upperFirst(exports.cleanIdString(v.id))
                    const wrappedQuery = exports.wrapWithQuery(`${queryName}Query`, v.query)

                    const result = await graphql(
                        `
                            ${wrappedQuery}
                        `
                    )
                    data = result.data

                    logToFile(dataFileName, data, {
                        mode: 'overwrite',
                        dirPath: dataDirPath
                    })
                }
                pageData = _.merge(pageData, data)
            }
        }
    }

    const finishedAt = new Date()
    const duration = finishedAt.getTime() - startedAt.getTime()
    const pageQueryName = exports.cleanIdString(page.id)

    logToFile(
        `${config.slug}__${pageQueryName}.json`,
        { data: pageData, duration },
        { mode: 'overwrite', subDir: 'data', surveyId: config.surveyId }
    )

    console.log(`-> Done in ${duration}ms`)
    return pageData
}

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '')

// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly

exports.getTwitterUser = async twitterName => {
    try {
        const data = await roClient.v2.userByUsername(twitterName, {
            'user.fields': ['public_metrics', 'profile_image_url', 'description']
        })
        const user = data && data.data
        return user
    } catch (error) {
        console.log(`// getTwitterUser error for ${twitterName}`)
        // console.log(error)
        console.log(error.rateLimit)
        const resetTime = new Date(error.rateLimit.reset * 1000)
        console.log(resetTime)
        console.log(error.data)
        return
    }
}

exports.sleep = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
