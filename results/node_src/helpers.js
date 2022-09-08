const { omit } = require('lodash')
const { indentString } = require('./indent_string.js')
// const indentString = require('indent-string')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const fetch = require('node-fetch')
const yaml = require('js-yaml')
const { TwitterApi } = require('twitter-api-v2')

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

Loop over a page's blocks to assemble its page query

*/
exports.getPageQuery = page => {
    const queries = []
    page.blocks.forEach(b => {
        b?.variants.forEach(v => {
            if (v.query) {
                exports.logToFile(`${v.id}.graphql`, v.query.replace('dataAPI', 'query'), {
                    mode: 'overwrite',
                    subDir: 'queries'
                })
                queries.push(`# ${v.id}\n` + v.query)
            }
        })
    })
    return queries.length === 0
        ? undefined
        : `### ${page.id}
${queries.join('\n')}
`
}

/*

Log to file

*/
exports.logToFile = async (fileName, object, options = {}) => {
    try {
        if (process.env.NODE_ENV !== 'production') {
            const { mode = 'append', timestamp = false, subDir, dirPath } = options

            const logsDirPath = dirPath
                ? path.resolve(dirPath)
                : `${__dirname}/.logs${subDir ? `/${subDir}` : ''}`
            if (!fs.existsSync(logsDirPath)) {
                fs.mkdirSync(logsDirPath, { recursive: true })
            }
            const fullPath = `${logsDirPath}/${fileName}`
            const contents = typeof object === 'string' ? object : JSON.stringify(object, null, 2)
            const now = new Date()
            const text = timestamp ? now.toString() + '\n---\n' + contents : contents
            if (mode === 'append') {
                const stream = fs.createWriteStream(fullPath, { flags: 'a' })
                stream.write(text + '\n')
                stream.end()
            } else {
                fs.writeFile(fullPath, text, error => {
                    // throws an error, you could also catch it here
                    if (error) throw error

                    // eslint-disable-next-line no-console
                    console.log(`Object saved to ${fullPath}`)
                })
            }
        }
    } catch (error) {
        console.warn(`// error while trying to log out ${fileName}`)
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

Flatten sitemap into array of all blocks

*/
exports.getAllBlocks = sitemap => {
    let allBlocks = []
    sitemap.contents.forEach(page => {
        allBlocks = [...allBlocks, ...page.blocks]
        if (page.children) {
            page.children.forEach(childPage => {
                allBlocks = [...allBlocks, ...childPage.blocks]
            })
        }
    })
    return allBlocks
}

const Queries = {}

exports.runPageQuery = async ({ page, graphql }) => {
    const startedAt = new Date()
    console.log(`// Running GraphQL query for page ${page.id}…`)
    const pageQuery = exports.getPageQuery(page)
    let pageData = {}

    if (pageQuery) {
        const queryName = _.upperFirst(exports.cleanIdString(page.id))
        const wrappedPageQuery = exports.wrapWithQuery(`page${queryName}Query`, pageQuery)

        try {
            const start = new Date()
            const queryResults = await graphql(
                `
                    ${wrappedPageQuery}
                `
            )
            const end = new Date()
            const timeDiff = Math.round((end - start) / 1000)
            pageData = queryResults.data
            exports.logToFile(
                `${queryName}.json`,
                { data: pageData, duration: timeDiff },
                { mode: 'overwrite', subDir: 'data' }
            )
        } catch (error) {
            console.log(`// Error while loading data for page ${page.id}`)
            exports.logToFile(`${queryName}.graphql`, wrappedPageQuery, {
                mode: 'overwrite',
                subDir: 'error_queries'
            })
            console.log(pageQuery)
            console.log(error)
        }
    }
    const finishedAt = new Date()
    console.log(`-> Done in ${startedAt.getTime() - finishedAt.getTime()}ms`)
    return pageData
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

/*

Try loading data from disk or GitHub, or else run queries for *each block* in a page

*/
exports.runPageQueries = async ({ page, graphql, config }) => {
    const startedAt = new Date()
    console.log(`// Running GraphQL queries for page ${page.id}…`)

    const basePath = `./../../devographics-surveys/${config.slug}/${config.year}/results`
    const baseUrl = `https://devographics.github.io/surveys/${config.slug}/${config.year}/results`

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
                    exports.logToFile(queryFileName, v.query.replace('dataAPI', 'query'), {
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

                    exports.logToFile(dataFileName, data, {
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

    exports.logToFile(
        `${config.slug}__${pageQueryName}.json`,
        { data: pageData, duration },
        { mode: 'overwrite', subDir: 'data' }
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
