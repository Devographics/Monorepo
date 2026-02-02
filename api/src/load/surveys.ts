import { Survey, Edition, SurveyApiObject } from '../types/surveys'
import { RequestContext, Section } from '../types'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { existsSync } from 'fs'
import { readdir, readFile, lstat } from 'fs/promises'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import path from 'path'
import { setCache } from '../helpers/caching'
import { parseSurveys } from '../generate/generate'
import { getRepoSHA, listGitHubFiles } from '../external_apis'
import { exec } from 'child_process'
import { promisify } from 'util'

import userMetadataSection from './_user_metadata.yml'
import allFeaturesSection from './_all_features.yml'
import allLibrariesSection from './_all_libraries.yml'

import { addAutoFeatures, addAutoLibraries } from '../helpers/sections'

const execPromise = promisify(exec)

let allSurveys: SurveyApiObject[] = []
let surveysHash: string

// add `apiOnly` flags to questins
const makeAPIOnly = (sections: Section[]) =>
    sections.map(s => ({
        ...s,
        questions: s.questions.map(q => ({ ...q, apiOnly: true }))
    }))

interface LoadOrGetSurveysOptions {
    forceReload?: boolean
    context?: RequestContext
}
/**
 * Load surveys if not yet loaded on startup
 *
 * This will include hidden surveys
 */
export const loadOrGetSurveys = async (options: LoadOrGetSurveysOptions = {}) => {
    const { forceReload, context } = options

    if (context && (forceReload || allSurveys.length === 0)) {
        const { surveys, sha } = await loadSurveys()

        for (const survey of surveys) {
            for (const edition of survey.editions) {
                if (!edition.apiSections) {
                    edition.apiSections = []
                }
                // add default user_metadata section
                edition.apiSections.push(userMetadataSection)

                if (addAutoFeatures(edition)) {
                    edition.apiSections.push(allFeaturesSection)
                }
                if (addAutoLibraries(edition)) {
                    edition.apiSections.push(allLibrariesSection)
                }
            }
        }
        allSurveys = await parseSurveys({ surveys, context })
        surveysHash = sha
    }
    return { surveys: allSurveys, sha: surveysHash }
}

const getGitHubYamlFile = async (url: string) => {
    const response = await fetch(url)
    const contents = await response.text()
    try {
        const yamlContents: any = yaml.load(contents)
        return yamlContents
    } catch (error) {
        console.log(`// Error loading file ${url}`)
        console.log(error)
    }
}

/**
 * Skip files found on the github repository:
 * - starting with "_"
 * - special .github folder
 * @param fileName
 * @returns
 */
const skipItem = (fileName: string) => ['_', '.'].includes(fileName.slice(0, 1))

export const loadFromGitHub = async () => {
    const surveys: Survey[] = []

    const [owner, repo, surveysDirPath] = getEnvVar(EnvVar.GITHUB_PATH_SURVEYS)?.split('/') || []

    if (!owner) {
        throw new Error(
            'loadFromGitHub: env variable GITHUB_PATH_SURVEYS did not contain [owner] segment'
        )
    }
    if (!repo) {
        throw new Error(
            'loadFromGitHub: env variable GITHUB_PATH_SURVEYS did not contain [repo] segment'
        )
    }

    const getUrl = (path: string = '') => {
        return `/repos/${owner}/${repo}/contents/${path}`
    }

    console.log(`📖 loading surveys repo (${getUrl()})`)

    const repoDirContents = await listGitHubFiles({ owner, repo, path: surveysDirPath })

    // loop over repo contents and fetch raw yaml files
    for (const file of repoDirContents) {
        if (file.type === 'dir') {
            if (skipItem(file.name)) {
                continue
            }
            console.log(`📖 Loading survey ${file.name}… (${getUrl(file.path)})`)
            const editions: any[] = []
            let surveyConfigYaml: any = { id: 'default' }
            const surveyDirContents = await listGitHubFiles({
                owner,
                repo,
                path: file.path
            })

            for (const file2 of surveyDirContents) {
                if (skipItem(file2.name)) {
                    continue
                }
                if (file2.name === 'config.yml') {
                    // found config.yml for survey
                    surveyConfigYaml = await getGitHubYamlFile(file2.download_url)
                } else if (file2.type === 'dir') {
                    console.log(`    -> Edition ${file2.name}… (${getUrl(file2.path)})`)
                    const editionsDirContents = await listGitHubFiles({
                        owner,
                        repo,
                        path: file2.path
                    })
                    let edition = {}
                    for (const file3 of editionsDirContents) {
                        if (file3.name === 'config.yml') {
                            // found config.yml for edition
                            const editionConfigYaml = await getGitHubYamlFile(file3.download_url)
                            edition = { ...edition, ...editionConfigYaml }
                        } else if (file3.name === 'questions.yml') {
                            // found config.yml for edition
                            const editionQuestionsYaml = await getGitHubYamlFile(file3.download_url)
                            if (
                                Array.isArray(editionQuestionsYaml) &&
                                editionQuestionsYaml.length > 0
                            ) {
                                edition = { ...edition, sections: editionQuestionsYaml }
                            }
                        } else if (file3.name === 'api.yml') {
                            // found api.yml for edition
                            const editionApiYaml = await getGitHubYamlFile(file3.download_url)
                            if (Array.isArray(editionApiYaml) && editionApiYaml.length > 0) {
                                edition = { ...edition, apiSections: makeAPIOnly(editionApiYaml) }
                            }
                        } else if (file3.name === 'sitemap.yml') {
                            // found sitemap.yml for edition
                            const editionSitemapYaml = await getGitHubYamlFile(file3.download_url)
                            if (
                                Array.isArray(editionSitemapYaml) &&
                                editionSitemapYaml.length > 0
                            ) {
                                edition = { ...edition, sitemap: editionSitemapYaml }
                            }
                        }
                    }
                    editions.push(edition)
                }
            }
            const survey = { ...surveyConfigYaml, editions }
            surveys.push(survey)
        }
    }
    const sha = await getRepoSHA({ owner: 'devographics', repo: 'surveys' })
    return { surveys, sha }
}

const excludeDirs = ['.git', '.DS_Store']

// when developing locally, load from local files
export const loadLocally = async () => {
    const surveys: Survey[] = []

    const surveysPath = getEnvVar(EnvVar.SURVEYS_PATH)
    const surveysDirPath = path.resolve(surveysPath)

    console.log(`📖 loading surveys locally (${surveysDirPath})`)

    const surveysDirs = await readdir(surveysDirPath)

    // loop over dir contents and fetch raw yaml files
    for (const surveyDirName of surveysDirs) {
        if (skipItem(surveyDirName)) {
            continue
        }
        const editions = []
        const surveyDirPath = surveysDirPath + '/' + surveyDirName
        const stat = await lstat(surveyDirPath)
        if (!excludeDirs.includes(surveyDirName) && stat.isDirectory()) {
            console.log(`📖 Loading survey ${surveyDirName}…`)

            const surveyConfigContents = await readFile(surveyDirPath + '/config.yml', 'utf8')
            const surveyConfigYaml: any = yaml.load(surveyConfigContents)
            const editionsDirs = await readdir(surveyDirPath)

            for (const editionDirName of editionsDirs) {
                if (skipItem(editionDirName)) {
                    console.log(`    -> Skipping ${editionDirName}…`)
                    continue
                }
                const editionDirPath = `${surveyDirPath}/${editionDirName}`
                const stat = await lstat(editionDirPath)
                if (!excludeDirs.includes(editionDirName) && stat.isDirectory()) {
                    console.log(`    -> Edition ${editionDirName}…`)
                    let edition
                    try {
                        const editionConfigContents = await readFile(
                            editionDirPath + '/config.yml',
                            'utf8'
                        )
                        const editionConfigYaml: any = yaml.load(editionConfigContents)
                        edition = editionConfigYaml
                    } catch (error) {}
                    const questionsPath = editionDirPath + '/questions.yml'
                    if (existsSync(questionsPath)) {
                        try {
                            const editionQuestionsContents = await readFile(questionsPath, 'utf8')
                            const editionQuestionsYaml: any = yaml.load(editionQuestionsContents)
                            edition.sections = editionQuestionsYaml
                        } catch (error) {
                            console.log(
                                `YAML parsing error for questions.yml edition ${editionDirName}`
                            )
                            console.log(error)
                        }
                    }

                    const apiPath = editionDirPath + '/api.yml'
                    if (existsSync(apiPath)) {
                        try {
                            const editionApiContents = await readFile(apiPath, 'utf8')
                            const editionApiYaml: any = yaml.load(editionApiContents)
                            if (Array.isArray(editionApiYaml) && editionApiYaml.length > 0) {
                                edition.apiSections = makeAPIOnly(editionApiYaml)
                            }
                        } catch (error) {
                            console.log(`YAML parsing error for api.yml edition ${editionDirName}`)
                            console.log(error)
                        }
                    }

                    const sitemapPath = editionDirPath + '/sitemap.yml'
                    if (existsSync(sitemapPath)) {
                        try {
                            const editionSitemapContents = await readFile(sitemapPath, 'utf8')
                            const editionSitemapYaml: any = yaml.load(editionSitemapContents)
                            edition.sitemap = editionSitemapYaml
                        } catch (error) {
                            console.log(
                                `YAML parsing error for sitemap.yml edition ${editionDirName}`
                            )
                            console.log(error)
                        }
                    }

                    editions.push(edition)
                }
            }

            const survey = { ...surveyConfigYaml, editions }
            surveys.push(survey)
        }
    }
    try {
        const shaExec = await execPromise('git rev-parse --verify HEAD', { cwd: surveysDirPath })
        const sha = shaExec.stdout
        return { surveys, sha }
    } catch (err) {
        console.warn(`Couldn't compute local repository SHA at path ${surveysDirPath}, error:`, err)
    }
    // TODO: when loading locally, we can get the SHA using git commands
    return { surveys, sha: '<local repository>' }
}

export const getSurveysLoadMethod = () => (getEnvVar(EnvVar.SURVEYS_PATH) ? 'local' : 'github')

// load locales contents through GitHub API or locally
export const loadSurveys = async () => {
    const mode = getSurveysLoadMethod()
    console.log(`// loading surveys (mode: ${mode})`)
    const { surveys, sha } = mode === 'local' ? await loadLocally() : await loadFromGitHub()
    console.log(`// done loading ${surveys.length} surveys; commit SHA: ${sha}`)

    return { surveys, sha }
}

export const initSurveys = async ({ context }: { context: RequestContext }) => {
    console.log('// initializing surveys')
    const { surveys } = await loadOrGetSurveys({ context, forceReload: true })
    // TODO: fix RangeError: Invalid string length error
    // logToFile('surveys.json', surveys, { mode: 'overwrite' })
    allSurveys = surveys
    return surveys
}

export const getSurveys = async () => {
    return allSurveys
}

// Look up entities by id, name, or aliases (case-insensitive)
// export const getEntity = async ({ id }: { id: string | number }) => {
//     const entities = await loadOrGetSurveys()

//     if (!id || typeof id !== 'string') {
//         return
//     }

//     const lowerCaseId = id.toLowerCase()
//     // some entities are only for normalization and should not be made available through API
//     const entity = entities
//         .filter(e => !e.normalizationOnly)
//         .find(e => {
//             return (
//                 (e.id && e.id.toLowerCase() === lowerCaseId) ||
//                 (e.id && e.id.toLowerCase().replace(/\-/g, '_') === lowerCaseId) ||
//                 (e.name && e.name.toLowerCase() === lowerCaseId) ||
//                 (e.aliases && e.aliases.find((a: string) => a.toLowerCase() === lowerCaseId))
//             )
//         })

//     return entity
// }

export const cacheSurveys = async ({
    surveys,
    // entities,
    context
}: {
    surveys: Survey[]
    // entities: Entity[]
    context: RequestContext
}) => {
    console.log(`// Initializing surveys cache (Redis)…`)

    setCache(getAllSurveysCacheKey(), surveys, context)

    const surveysWithoutOutlines = surveys.map(({ editions, ...surveyRest }) => {
        const editionsWithoutOutlines = editions.map(({ sections, ...editionRest }) => editionRest)
        return { ...surveyRest, editions: editionsWithoutOutlines }
    })
    setCache(getAllSurveysMetadataCacheKey(), surveysWithoutOutlines, context)

    for (const survey of surveys) {
        const { editions, ...rest } = survey
        for (const edition of editions) {
            const item = { ...edition, survey: rest }
            setCache(getEditionCacheKey({ edition }), item, context)
        }
    }
    console.log(`-> Cached ${surveys.length} surveys (${surveys.map(s => s.id).join()})`)
}

export const getAllSurveysCacheKey = () => `surveys_all`

export const getAllSurveysMetadataCacheKey = () => `surveys_all_metadata`

export const getEditionCacheKey = ({ edition }: { edition: Edition }) => `surveys_${edition.id}`

export default allSurveys
