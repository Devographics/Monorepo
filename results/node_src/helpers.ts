import omit from 'lodash/omit.js'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { TwitterApi } from 'twitter-api-v2'
import { logToFile } from './log_to_file'
// import { allowedCachingMethods } from "@devographics/fetch"
import { PageContextValue, PageDef } from '../src/core/types'
import template from 'lodash/template.js'

import { getMetadataQuery } from './queries/fragments/getMetadataQuery'

/**
 * Get caching methods based on current config
 * It can enable or disable either caching or writing, depending on the cache type
 */
export const allowedCachingMethods = (): {
    /**
     * .logs folder (only used for writing, for debugging purpose)
     */
    filesystem: boolean
    /**
     * GraphQL API
     * TODO: it's not a cache but the source of truth, why using this?
     */
    api: boolean
    /**
     * Redis
     */
    redis: boolean
} => {
    let cacheLevel = { filesystem: true, api: true, redis: true }
    if (process.env.DISABLE_CACHE === 'true') {
        cacheLevel = { filesystem: false, api: false, redis: false }
    } else {
        if (process.env.DISABLE_FILESYSTEM_CACHE === 'true') {
            cacheLevel.filesystem = false
        }
        if (process.env.DISABLE_API_CACHE === 'true') {
            cacheLevel.api = false
        }
        if (process.env.DISABLE_REDIS_CACHE === 'true') {
            cacheLevel.redis = false
        }
    }
    return cacheLevel
}

// import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

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


*/

/**
 *
 * Get a page's context
 *= the information that are passed down from Gatsby to the page
 */
export const getPageContext = (page: PageDef): PageContextValue => {
    const context: any = omit(page, ['path', 'children'])
    context.basePath = page.path

    return {
        ...context,
        ...page.data
    }
}

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
                        component: path.resolve(`./src/core/share/ShareBlockTemplate.tsx`),
                        context: {
                            ...context,
                            redirect: `${getLocalizedPath(page.path, locale)}#${blockVariant.id}`,
                            block: blockVariant,
                            locales: getCleanLocales(locales),
                            locale,
                            localeId: locale.id
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
export const getExistingJSON = async ({
    localPath,
    remoteUrl
}: {
    localPath: string
    remoteUrl: string
}) => {
    let contents, data
    if (getLoadMethod() === 'local') {
        if (fs.existsSync(localPath)) {
            contents = fs.readFileSync(localPath, 'utf8')
        }
    } else {
        console.log(`// fetching ${remoteUrl}…`)
        const response = await fetch(remoteUrl)
        contents = await response.text()
    }
    try {
        data = JSON.parse(contents)
    } catch (error) {
        return
    }
    return data
}

/*

Get a file from the disk or from GitHub

*/
export const getExistingString = async ({
    localPath,
    remoteUrl
}: {
    localPath: string
    remoteUrl: string
}) => {
    let contents
    if (getLoadMethod() === 'local') {
        if (fs.existsSync(localPath)) {
            contents = fs.readFileSync(localPath, 'utf8')
        }
    } else {
        console.log(`// fetching ${remoteUrl}…`)
        const response = await fetch(remoteUrl)
        contents = await response.text()
    }
    return contents
}

// if SURVEYS_URL is defined, then use that to load surveys;
// if not, look in local filesystem
export const getLoadMethod = () => (process.env.SURVEYS_URL ? 'remote' : 'local')

export const getDataLocations = (surveyId, editionId) => {
    return {
        localPath: `${process.env.SURVEYS_PATH}/${surveyId}/${editionId}`,
        url: `${process.env.SURVEYS_URL}/${surveyId}/${editionId}`
    }
}

const cleanQuery = (query: string) => query.replaceAll('\n', '').replaceAll(' ', '')

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
        if (error?.rateLimit) {
            console.log('// Rate Limit error')
            console.log(error.rateLimit)
            const resetTime = new Date(error.rateLimit.reset * 1000)
            console.log(resetTime)
        }
        console.log(error?.data)
        return
    }
}

export const sleep = ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

export const getQuestionId = (id, facet) => (facet ? `${id}_by_${facet}` : id)

export function removeNull(obj) {
    const clean = Object.fromEntries(
        Object.entries(obj)
            .map(([k, v]) => [k, v === Object(v) ? removeNull(v) : v])
            .filter(([_, v]) => v != null && (v !== Object(v) || Object.keys(v).length))
    )
    return Array.isArray(obj) ? Object.values(clean) : clean
}

export const getMetadata = async ({ surveyId, editionId, graphql }) => {
    const metadataQuery = getMetadataQuery({ surveyId, editionId })

    logToFile('metadataQuery.graphql', metadataQuery, {
        mode: 'overwrite'
        //editionId
    })

    const metadataResults = removeNull(
        await graphql(
            `
                ${metadataQuery}
            `
        )
    )
    if (metadataResults.errors) {
        const err = new Error(metadataResults.errors[0].message)
        err.fatal = true
        throw err
    }
    const metadataData = metadataResults?.data?.dataAPI
    logToFile('metadataData.json', metadataData, {
        mode: 'overwrite'
        // editionId
    })
    const currentSurvey = metadataData.surveys[surveyId]._metadata
    const currentEdition = metadataData.surveys[surveyId][editionId]._metadata
    if (!currentSurvey) {
        throw new Error(`getMetadata: could not find survey for id ${surveyId}`)
    }
    if (!currentEdition) {
        throw new Error(`getMetadata: could not find edition for id ${surveyId}/${editionId}`)
    }
    return { currentSurvey, currentEdition }
}

/**
 * Example:
 * APOLLO_SERVER_CORS_WHITELIST=http://localhost:5000,https://www.my-client.org
 * => parse the string and makes it an array
 * @param {*} variable Env array variables, with values separated by a comma (spaces allowed)
 */
export const parseEnvVariableArray = (variable = '') => {
    if (!variable) return []
    return variable.split(',').map(s => s.trim())
}

export const getTranslationContexts = ({
    surveyId,
    editionId
}: {
    surveyId: string
    editionId: string
}) => {
    const baseContexts = ['homepage', 'common', 'results', 'countries']
    const extraTranslationContexts = parseEnvVariableArray(process.env.CUSTOM_LOCALE_CONTEXTS)
    return [...baseContexts, ...extraTranslationContexts, surveyId, editionId]
}

/*

This takes a string query and inserts variables
- surveyId
- editionId
- sectionId
- questionId
*/
type QueryVariables = {
    surveyId: string
    editionId: string
    sectionId: string
    questionId: string
}
export const parseCustomQuery = ({
    query,
    variables
}: {
    query: string
    variables: QueryVariables
}) => {
    try {
        const interpolatedQuery = template(query)(variables)
        return interpolatedQuery
    } catch (error) {
        console.log(`// parseCustomQuery error in question "${variables.questionId}"`)
        console.log(error)
    }
}
