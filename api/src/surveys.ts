import { RequestContext, Survey, SurveyEdition } from './types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { logToFile } from './debug'
import { setCache } from './caching'

import { loadSurveysLocally } from "@devographics/core-models/server"

let allSurveys: Survey[] = []

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// load locales if not yet loaded
export const loadOrGetSurveys = async (
    options: { forceReload?: boolean } = { forceReload: false }
) => {
    const { forceReload } = options

    if (forceReload || allSurveys.length === 0) {
        allSurveys = await loadSurveys()
    }
    return allSurveys
}

const options = {
    owner: 'Devographics',
    repo: 'surveys'
}
const listGitHubFiles = async (ghPath: string) => {
    const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        ...options,
        path: ghPath
    })
    return contents.data as any[]
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

export const loadFromGitHub = async () => {
    console.log(`-> loading surveys repo`)
    const surveys: Survey[] = []

    const repoDirContents = await listGitHubFiles('')

    // loop over repo contents and fetch raw yaml files
    for (const file of repoDirContents) {
        if (file.type === 'dir') {
            console.log(`// Loading survey ${file.name}…`)
            const editions: any[] = []
            let editionConfigYaml: any = {}
            const surveyDirContents = await listGitHubFiles(file.path)

            for (const file2 of surveyDirContents) {
                if (file2.name === 'config.yml') {
                    // found config.yml for survey
                    editionConfigYaml = await getGitHubYamlFile(file2.download_url)
                } else if (file2.type === 'dir') {
                    console.log(`    -> Edition ${file2.name}…`)
                    const editionsDirContents = await listGitHubFiles(file2.path)
                    let edition = {}
                    for (const file3 of editionsDirContents) {
                        if (file3.name === 'config.yml') {
                            // found config.yml for edition
                            const editionConfigYaml = await getGitHubYamlFile(file3.download_url)
                            edition = { ...edition, ...editionConfigYaml }
                        } else if (file3.name === 'questions.yml') {
                            // found config.yml for edition
                            const editionQuestionsYaml = await getGitHubYamlFile(file3.download_url)
                            edition = { ...edition, questions: editionQuestionsYaml }
                        }
                    }
                    editions.push(edition)
                }
            }
            const survey = { ...editionConfigYaml, editions }
            surveys.push(survey)
        }
    }
    return surveys
}

// load locales contents through GitHub API or locally
export const loadSurveys = async () => {
    console.log('// loading surveys')

    const surveys: Survey[] =
        process.env.LOAD_DATA === 'local' ? await loadSurveysLocally() : await loadFromGitHub()
    console.log(`// done loading ${surveys.length} surveys`)

    return surveys
}

export const initSurveys = async () => {
    console.log('// initializing surveys')
    const surveys = await loadOrGetSurveys({ forceReload: true })
    logToFile('surveys.json', surveys, { mode: 'overwrite' })
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
        const editionsWithoutOutlines = editions.map(({ questions, ...editionRest }) => editionRest)
        return { ...surveyRest, editions: editionsWithoutOutlines }
    })
    setCache(getAllSurveysMetadataCacheKey(), surveysWithoutOutlines, context)

    for (const survey of surveys) {
        const { editions, ...rest } = survey
        for (const edition of editions) {
            const item = { ...edition, survey: rest }
            setCache(getSurveyCacheKey({ survey, edition }), item, context)
        }
    }
    console.log(`-> Cached ${surveys.length} surveys (${surveys.map(s => s.name).join()})`)
}

export const getAllSurveysCacheKey = () => `surveys_all`

export const getAllSurveysMetadataCacheKey = () => `surveys_all_metadata`

export const getSurveyCacheKey = ({
    survey,
    edition
}: {
    survey?: Survey
    edition?: SurveyEdition
}) => `surveys_${edition.surveyId}`

export default allSurveys
