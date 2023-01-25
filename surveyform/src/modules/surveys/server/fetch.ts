// TODO: this will systematically call github API
// we should cache the result somewhere
// for instance in a place dedicated to the survey form on Redis
import { SurveyDocument, SerializedSurveyDocument } from "@devographics/core-models";
import yaml from "js-yaml"
import { serverConfig } from "~/config/server";
import { SurveyDescription } from "../typings";
import orderBy from "lodash/orderBy.js"

const org = "devographics"
const repo = "surveys"
const reposRoot = "https://api.github.com/repos"
// @see https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
const contentsRoot = `${reposRoot}/${org}/${repo}/contents`

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
function yamlAsJson(content: any) {
    const decoded = atob(content)
    const json = yaml.load(decoded)
    return json
}

// I don't trust SDKs forget about using octokit :(
async function fetchGithub(url) {
    const githubAuthorization = `Bearer ${serverConfig.githubToken}`
    return fetch(url, {
        headers: {
            "Authorization": githubAuthorization
        }
    })
}

/// One survey + questions

/**
 * @param slug Slug of the survey from URL
 * /!\ this is different from the github folder path, we need to replace "-" by "_"
 * @param year 
 */
export async function fetchSurveyGithub(slug: SerializedSurveyDocument["slug"], year: string): Promise<SerializedSurveyDocument> {
    const safeSlug = slug?.replaceAll("-", "_")
    const surveyFolder = `${safeSlug}`
    const yearlyFolder = `${surveyFolder}/${year}`

    const configUrl = `${contentsRoot}/${yearlyFolder}/config.yml`
    const commonConfigUrl = `${contentsRoot}/${surveyFolder}/config.yml`

    const configRes = await fetchGithub(configUrl)
    if (!configRes.ok) {
        console.debug("Fetched url", configUrl)
        throw new Error(`Cannot fetch survey config for slug "${slug}" and year "${year}", error ${configRes.status}"`)
    }
    const questionsRes = await fetchGithub(`${contentsRoot}/${yearlyFolder}/questions.yml`)
    if (!questionsRes.ok) {
        throw new Error(`Cannot fetch survey questions for slug "${slug}" and year "${year}, error ${configRes.status}"`)
    }
    const commonConfigRes = await fetchGithub(commonConfigUrl)
    if (!commonConfigRes.ok) {
        console.warn("No common config for survey", slug)
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
        // url friendly slug
        prettySlug: safeSlug,// slug,//safeSlug,
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
async function fetchSurveyDescription(surveyFolder: string, year: string): Promise<SerializedSurveyDocument> {
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

async function fetchRecentYearsFolder(surveySlug: SurveyDocument["slug"]) {
    const surveyPath = `${contentsRoot}/${surveySlug}`
    const yearsRes = await fetchGithub(surveyPath)
    const recentYearsFolders = (await githubBody(yearsRes) as Array<GhFileOrDir>)
        .filter(isDir)
        .filter(dir => {
            const year = parseInt(dir.name)
            if (isNaN(year)) return false
            if (year < yearThreshold) return false
            return true
        })
    return recentYearsFolders

}

export const fetchSurveysListGithub = async (): Promise<Array<SurveyDescription>> => {
    const contentRes = await fetchGithub(contentsRoot)
    const surveysFolders = (await githubBody(contentRes) as Array<GhFileOrDir>)
        .filter(fileOrDir => fileOrDir.type === "dir")

    let surveys: Array<SerializedSurveyDocument> = []
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