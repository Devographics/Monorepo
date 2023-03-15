import omit from 'lodash/omit.js'
import { indentString } from './indent_string.mjs'
import upperFirst from 'lodash/upperFirst.js'
import merge from 'lodash/merge.js'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { TwitterApi } from 'twitter-api-v2'
import { logToFile } from './log_to_file.mjs'
import { getDefaultQuery, getDefaultQueryName, getDefaultQueryBody } from './queries.mjs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

const __dirname = path.dirname(__filename)

const fsPromises = fs.promises
/*

Get the localized version of a page path

*/
export const getLocalizedPath = (path, locale) => (locale ? `/${locale.id}${path}` : path)

/*

Get locales without the strings, to avoid loading every locale's dictionnary in memory

Also add paths

*/
export const getCleanLocales = locales =>
    locales.map(l => ({ path: `/${l.id}`, ...omit(l, ['strings']) }))

/*

Get a page's context

*/
export const getPageContext = page => {
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
export const cleanIdString = id => id.replace(new RegExp('-', 'g'), '_')

/*

Wrap query contents with query FooQuery {...}

*/
export const wrapWithQuery = (queryName, queryContents) => `query ${queryName} {
  ${indentString(queryContents, 4)}
  }`

/*

Load a template yml file

*/
export const loadTemplate = async name => {
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
export const createBlockPages = (page, context, createPage, locales, buildInfo) => {
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
                        // defer: true,
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
export const getExistingData = async ({ dataFileName, dataFilePath, baseUrl }) => {
    let contents, data
    if (process.env.JSON_CACHE_TYPE === 'local') {
        if (fs.existsSync(dataFilePath)) {
            contents = fs.readFileSync(dataFilePath, 'utf8')
        }
    } else {
        const response = await fetch(`${baseUrl}/data/${dataFileName}`)
        contents = await response.text()
    }
    try {
        data = JSON.parse(contents)
    } catch (error) {
        return
    }
    return data
}

export const getDataLocations = (surveyId, editionId) => ({
    localPath: `./../../surveys/${surveyId}/${editionId}`,
    url: `https://devographics.github.io/surveys/${surveyId}/${editionId}`
})

/*

Try loading data from disk or GitHub, or else run queries for *each block* in a page

*/
export const runPageQueries = async ({ page, graphql, surveyId, editionId }) => {
    const startedAt = new Date()
    const useCache = process.env.USE_CACHE === 'false' ? false : true
    console.log(`// Running GraphQL queries for page ${page.id}… (useCache=${useCache})`)

    const paths = getDataLocations(surveyId, editionId)

    const basePath = paths.localPath + '/results'
    const baseUrl = paths.url + '/results'

    let pageData = {}

    for (const b of page.blocks) {
        for (const v of b.variants) {
            if (v.query || v.loadData) {
                let data

                const dataDirPath = path.resolve(`${basePath}/data`)
                const dataFileName = `${page.id}__${v.id}.json`
                const dataFilePath = `${dataDirPath}/${dataFileName}`
                const queryDirPath = path.resolve(`${basePath}/queries`)
                const queryFileName = `${page.id}__${v.id}.graphql`
                const queryFilePath = `${queryDirPath}/${queryFileName}`

                const existingData = await getExistingData({
                    dataFileName,
                    dataFilePath,
                    baseUrl
                })
                if (existingData && useCache) {
                    const loadingMethod =
                        process.env.JSON_CACHE_TYPE === 'local' ? 'disk' : 'GitHub'
                    console.log(
                        `// 🎯 File ${dataFileName} found on ${loadingMethod}, loading its contents…`
                    )
                    data = existingData
                } else {
                    const queryOptions = {
                        surveyId,
                        editionId,
                        sectionId: page.id,
                        questionId: v.id,
                        parameters: v?.variables?.parameters
                    }

                    const query = v.query
                        ? wrapWithQuery(`${upperFirst(cleanIdString(v.id))}Query`, v.query)
                        : getDefaultQuery({
                              surveyId,
                              editionId,
                              sectionId: page.id,
                              questionId: b.id
                          })

                    if (query.includes('dataAPI')) {
                        // only log out queries to dataAPI, not to internalAPI
                        const queryLog = `query ${getDefaultQueryName(
                            queryOptions
                        )} {  ${getDefaultQueryBody(queryOptions)}}`

                        logToFile(queryFileName, queryLog, {
                            mode: 'overwrite',
                            dirPath: queryDirPath,
                            editionId
                        })
                    }

                    const result = await graphql(
                        `
                            ${query}
                        `
                    )
                    data = result.data

                    logToFile(dataFileName, data, {
                        mode: 'overwrite',
                        dirPath: dataDirPath,
                        editionId
                    })
                }
                pageData = merge(pageData, data)
            }
        }
    }

    const finishedAt = new Date()
    const duration = finishedAt.getTime() - startedAt.getTime()
    const pageQueryName = cleanIdString(page.id)

    logToFile(
        `${editionId}__${pageQueryName}.json`,
        { data: pageData, duration },
        { mode: 'overwrite', subDir: 'data', editionId }
    )

    console.log(`-> Done in ${duration}ms`)
    return pageData
}

// Instanciate with desired auth type (here's Bearer v2 auth)
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '')

// Tell typescript it's a readonly app
const roClient = twitterClient.readOnly

export const getTwitterUser = async twitterName => {
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

export const sleep = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}