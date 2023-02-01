// @see api/src/surveys.ts
// TODO: try to factor the code
// TODO: create/use a Redis alternative too

//import "server-only"
// TODO: this will systematically call github API
// we should cache the result somewhere
// for instance in a place dedicated to the survey form on Redis
import yaml from "js-yaml"
import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from "../typings";
import orderBy from "lodash/orderBy.js"

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
// content of a directory
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
        throw new Error("Hitting GitHub API rate limit, can't fetch: " + url)
    }
    return body
}

/// One survey + questions

/**
 * @param slug Slug of the survey from URL
 * /!\ this is different from the github folder path, we need to replace "-" by "_"
 * @param year 
 */
export async function fetchSurveyGithub(prettySlug: SurveyEdition["prettySlug"], year: string): Promise<SurveyEdition> {
    // TODO: find a cleaner way to convert prettySLug to slug => do this before calling this function
    const slug = prettySlug?.replaceAll("-", "_")
    const surveyFolder = `${slug}`
    const yearlyFolder = `${surveyFolder}/${year}`

    const configUrl = `${contentsRoot}/${yearlyFolder}/config.yml`
    const commonConfigUrl = `${contentsRoot}/${surveyFolder}/config.yml`

    const configRes = await fetchGithub(configUrl)
    if (!configRes.ok) {
        console.debug("Fetched url", configUrl)
        throw new Error(`Cannot fetch survey config for slug "${prettySlug}" and year "${year}", error ${configRes.status}"`)
    }
    const questionsRes = await fetchGithub(`${contentsRoot}/${yearlyFolder}/questions.yml`)
    if (!questionsRes.ok) {
        throw new Error(`Cannot fetch survey questions for slug "${prettySlug}" and year "${year}, error ${configRes.status}"`)
    }
    const commonConfigRes = await fetchGithub(commonConfigUrl)
    if (!commonConfigRes.ok) {
        console.warn("No common config for survey", prettySlug)
    }
    const surveyConfig = await yamlAsJson(await githubContent(configRes))
    const questionsConfig = await yamlAsJson(await githubContent(questionsRes))
    const commonConfig = commonConfigRes ? await yamlAsJson(await githubContent(commonConfigRes)) : {}
    //console.debug({ surveyConfig, questionsConfig })

    // @ts-ignore
    const survey = {
        // @ts-ignore
        ...commonConfig,
        // @ts-ignore
        ...surveyConfig,
        prettySlug,
        outline: questionsConfig
    }
    return survey
}

/// Surveys list

/**
 * Get the survey description, but not the questions
 * @param name Name on github /!\ this is different from the slug
 * @param year 
 * @returns 
 */
async function fetchSurveyDescription(surveyFolder: string, year: string): Promise<SurveyEdition> {
    const yearlyFolder = `${surveyFolder}/${year}`
    const configUrl = `${contentsRoot}/${yearlyFolder}/config.yml`
    const commonConfigUrl = `${contentsRoot}/${surveyFolder}/config.yml`

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
        // url friendly slug
        prettySlug: surveyFolder,// slug,//safeSlug,
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

async function fetchRecentYearsFolder(surveySlug: SurveyEdition["slug"]) {
    const surveyPath = `${contentsRoot}/${surveySlug}`
    const yearsFolders = await fetchGithubJson<Array<GhFileOrDir>>(surveyPath)
    const recentYearsFolders = yearsFolders
        .filter(isDir)
        .filter(dir => {
            const year = parseInt(dir.name)
            if (isNaN(year)) return false
            if (year < yearThreshold) return false
            return true
        })
    return recentYearsFolders

}

export const fetchSurveysListGithub = async (): Promise<Array<SurveyEditionDescription>> => {
    const content = await fetchGithubJson<Array<GhFileOrDir>>(contentsRoot)
    console.log("content", content)
    const surveysFolders = content
        .filter(fileOrDir => fileOrDir.type === "dir")

    let surveys: Array<SurveyEdition> = []
    for (const surveyFolder of surveysFolders) {
        const recentYearsFolders = await fetchRecentYearsFolder(surveyFolder.name)
        for (const yearFolder of recentYearsFolders) {
            // TODO: we load too much data here
            const survey = await fetchSurveyDescription(surveyFolder.name, yearFolder.name)
            surveys.push(survey)
        }
    }
    if (process.env.NODE_ENV !== "development") {
        surveys = surveys.filter(s => s.slug !== "demo_survey")
    }
    const sorted = orderBy(surveys, ["year", "slug"], ["desc", "asc"])
    return sorted
    /*   {
           status: 2,
               name: "Demo survey",
                   year: 2022,
                       slug: "demo_survey",
                           prettySlug: "demo-survey",
                               imageUrl: "https://devographics.github.io/surveys/state_of_graphql/2022/images/graphql2022.png"
       }*/
}

// prettySlug is the one from the URL
export async function fetchSurveyContextGithub(slug: SurveySharedContext["slug"]): Promise<SurveySharedContext> {
    const surveyContextRes = await fetchGithub(`${contentsRoot}/${slug}/config.yml`)
    const surveyContext = yamlAsJson<SurveySharedContext>(await githubBody(surveyContextRes))
    return surveyContext
}

export async function fetchSurveyFromIdGithub(surveyId: SurveyEdition["surveyId"]) {
    const surveyList = await fetchSurveysListGithub()
    const surveyDescription = surveyList.find(s => s.surveyId)
    if (!surveyDescription) {
        throw new Error(`No survey with surveyId ${surveyId}`)
    }
    const survey = await fetchSurveyGithub(surveyDescription.slug, surveyDescription.year + "")
    return survey
}