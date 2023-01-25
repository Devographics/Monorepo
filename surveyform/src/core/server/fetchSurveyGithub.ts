import yaml from "js-yaml"
import type { SerializedSurveyDocument } from "@devographics/core-models";
import { serverConfig } from "~/config/server";

const org = "devographics"
const repo = "surveys"
const apiRoot = "https://api.github.com/repos"

async function githubYamlAsJson(res: Response) {
    const body = await res.json()
    if (!body) {
        throw new Error("Empty body in github response")
    }
    const content = body.content
    if (!content) {
        throw new Error("No content in github response body")
    }
    const decoded = atob(body.content)
    const json = yaml.load(decoded)
    return json
}
/**
 * TODO: should we use the "github.io" published URL instead? Might be slower
 * TODO: use personnal access token for safer API calls like we do in APIs
 * @param slug 
 * @param year 
 */
export async function fetchSurveyGithub(slug: SerializedSurveyDocument["slug"], year: string) {
    const githubAuthorization = `Bearer ${serverConfig.githubToken}`
    const safeSlug = slug?.replaceAll("-", "_")
    const surveyFolder = `${safeSlug}`
    const yearlyFolder = `${surveyFolder}/${year}`
    const contentsRoot = `${apiRoot}/${org}/${repo}/contents`
    const configUrl = `${contentsRoot}/${yearlyFolder}/config.yml`
    const commonConfigUrl = `${contentsRoot}/${surveyFolder}/config.yml`
    const configRes = await fetch(configUrl, {
        headers: {
            "Authorization": githubAuthorization
        }
    })
    if (!configRes.ok) {
        console.debug("Fetched url", configUrl)
        throw new Error(`Cannot fetch survey config for slug "${slug}" and year "${year}", error ${configRes.status}"`)
    }
    const questionsRes = await fetch(`${contentsRoot}/${yearlyFolder}/questions.yml`, {
        headers: {
            "Authorization": githubAuthorization
        }
    })
    if (!questionsRes.ok) {
        throw new Error(`Cannot fetch survey questions for slug "${slug}" and year "${year}, error ${configRes.status}"`)
    }
    const commonConfigRes = await fetch(commonConfigUrl, {
        headers: {
            "Authorization": githubAuthorization
        }

    })
    if (!commonConfigRes.ok) {
        console.warn("No common config for survey", slug)
    }
    const surveyConfig = await githubYamlAsJson(configRes)
    const questionsConfig = await githubYamlAsJson(questionsRes)
    const commonConfig = commonConfigRes ? await githubYamlAsJson(commonConfigRes) : {}
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
    } as SerializedSurveyDocument
    return survey
}