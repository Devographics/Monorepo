/**
 * Get results from GitHub, the source of truth for survey definitions
 * And transform them in the right shape expected by surveyform
 */

import { getSurveyEditionId } from "@devographics/core-models/surveys/shared";
import yaml from "js-yaml"
import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from "../typings";

const ghApiReposRoot = "https://api.github.com/repos"

const org = "devographics"
const repo = "surveys"
// @see https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
const contentsRoot = `${ghApiReposRoot}/${org}/${repo}/contents`

// Utils

async function githubBody(res: Response) {
    const body = await res.json()
    if (!body) {
        throw new Error("Empty body in github response")
    }
    return body
}
async function githubContent(res: Response) {
    const content = (await githubBody(res))?.content
    if (!content) {
        throw new Error("No content in github response body")
    }
    return content
}
function yamlAsJson<T = any>(content: any): T {
    const decoded = Buffer.from(content, "base64").toString()
    const json = yaml.load(decoded)
    return json as T
}
async function fetchGithub(url: string): Promise<Response> {
    const githubAuthorization = `Bearer ${process.env.GITHUB_TOKEN}`
    return fetch(url, {
        headers: {
            "Authorization": githubAuthorization
        }
    })
}
async function fetchGithubJson<T = any>(url: string): Promise<T> {
    const body = await githubBody(await fetchGithub(url))
    if (body?.message?.match(/API rate limit/)) {
        console.error(body)
        // log rate limit response
        fetchGithubJson("https://api.github.com/rate_limit").then((limit) => {
            console.error(
                "limited until (in GMT timezone):",
                new Date(limit?.rate?.reset * 1000).toISOString(),
                limit)
        }).catch(console.error)
        throw new Error("Hitting GitHub API rate limit, can't fetch: " + url)
    }
    return body
}


// Surveys

/**
 * Will throw if survey is not found/can't call github
 * @param surveyContextId 
 * @param editionId 
 * @returns 
 */
export async function fetchSurveyGithub(surveyContextId: string, editionId: string): Promise<SurveyEdition> {
    const surveyFolder = `${surveyContextId}`
    const editionFolder = editionId
    const yearlyFolder = `${surveyFolder}/${editionFolder}`

    const configUrl = `${contentsRoot}/${yearlyFolder}/config.yml`
    const commonConfigUrl = `${contentsRoot}/${surveyFolder}/config.yml`

    const configRes = await fetchGithub(configUrl)
    if (!configRes.ok) {
        console.debug("Fetched url", configUrl)
        throw new Error(`Cannot fetch survey config for survey context "${surveyContextId}" and editionId "${editionId}", error ${configRes.status}"`)
    }
    const questionsRes = await fetchGithub(`${contentsRoot}/${yearlyFolder}/questions.yml`)
    if (!questionsRes.ok) {
        throw new Error(`Cannot fetch survey questions for survey context "${surveyContextId}" and editionId "${editionId}, error ${configRes.status}"`)
    }
    const commonConfigRes = await fetchGithub(commonConfigUrl)
    if (!commonConfigRes.ok) {
        console.warn("No common config for survey", surveyContextId)
    }
    const surveyConfig = await yamlAsJson(await githubContent(configRes))
    const questionsConfig = await yamlAsJson(await githubContent(questionsRes))
    const commonConfig = commonConfigRes ? await yamlAsJson(await githubContent(commonConfigRes)) : {}
    //console.debug({ surveyConfig, questionsConfig })

    const survey = {
        ...commonConfig,
        ...surveyConfig,
        outline: questionsConfig,
        // TODO: merge the fields later than there, so that we don't have to update Redis cache everytime
        surveyContextId: commonConfig.id,
        surveyEditionId: surveyConfig.id,
    }
    return survey
}

/**
 * Get the survey description, but not the questions
 */
async function fetchSurveyDescription(surveyContextId: string, surveyEditionId: string): Promise<SurveyEdition> {
    const yearlyFolder = `${surveyContextId}/${surveyEditionId}`
    const configUrl = `${contentsRoot}/${yearlyFolder}/config.yml`
    const commonConfigUrl = `${contentsRoot}/${surveyContextId}/config.yml`

    const configRes = await fetchGithub(configUrl)
    const commonConfigRes = await fetchGithub(commonConfigUrl)
    const surveyConfig = yamlAsJson(await githubContent(configRes))
    const commonConfig = commonConfigRes ? yamlAsJson(await githubContent(commonConfigRes)) : {}
    // @ts-ignore
    const survey = {
        // @ts-ignore
        ...commonConfig,
        // @ts-ignore
        ...surveyConfig,
        surveyContextId: commonConfig.id,
        surveyEditionId: getSurveyEditionId(surveyConfig),
    }
    return survey
}


interface GhFileOrDir {
    // add relevant fields here
    // the github content payload includes an URL but it has an annoying query param at the end
    // using the path is the best solution
    // folder full path
    path: string,
    // folder name
    name: string,
    type: "dir" | "file"
}

const isDir = (fileOrDir: GhFileOrDir) => fileOrDir.type === "dir"

const yearThreshold = 2019

/**
 * @param surveyContextId state_of_js
 */
async function fetchEditionFolders(surveyContextId: string) {
    const surveyPath = `${contentsRoot}/${surveyContextId}`
    const yearsFolders = await fetchGithubJson<Array<GhFileOrDir>>(surveyPath)
    const editionFolders = yearsFolders
        .filter(isDir)
    return editionFolders

}

export const fetchSurveysListGithub = async (): Promise<Array<SurveyEditionDescription>> => {
    const content = await fetchGithubJson<Array<GhFileOrDir>>(contentsRoot)
    const surveysFolders = content
        .filter(fileOrDir => fileOrDir.type === "dir")

    let surveys: Array<SurveyEdition> = []
    for (const surveyFolder of surveysFolders) {
        const editionFolders = await fetchEditionFolders(surveyFolder.name)
        for (const editionFolder of editionFolders) {
            // TODO: we load too much data here
            const survey = await fetchSurveyDescription(surveyFolder.name, editionFolder.name)
            if (survey?.year && survey.year >= yearThreshold) {
                surveys.push(survey)
            }
        }
    }
    return surveys
}

/**
 * @param surveyContextId state_of_js
 */
export async function fetchSurveyContextGithub(surveyContextId: string): Promise<SurveySharedContext> {
    const surveyContextRes = await fetchGithub(`${contentsRoot}/${surveyContextId}/config.yml`)
    const surveyContext = yamlAsJson<SurveySharedContext>(await githubBody(surveyContextRes))
    return surveyContext
}
