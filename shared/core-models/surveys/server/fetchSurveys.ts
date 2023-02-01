import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from "../typings";
import NodeCache from 'node-cache'
import {
    fetchSurveyContextGithub,
    fetchSurveyFromIdGithub,
    fetchSurveyGithub, fetchSurveysListGithub
} from "./fetchGithub";

const surveysCache = new NodeCache({
    // TODO: make configurable
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false
})

async function fromSurveysCache<T = any>(key: string, func: () => Promise<T>) {
    console.time(key);
    if (surveysCache.has(key)) {
        console.debug("cache hit", key)
        const res = await surveysCache.get<Promise<T>>(key)!
        console.timeEnd(key)
        return res
    }
    console.debug("cache miss", key)
    const promise = func()
    surveysCache.set(key, promise)
    console.timeEnd(key)
    return await promise
}

export async function fetchSurvey(prettySlug: SurveyEdition["prettySlug"], year: string): Promise<SurveyEdition> {
    const key = `survey_${prettySlug}_promise`
    return await fromSurveysCache(
        key,
        () => fetchSurveyGithub(prettySlug, year)
    )
}

export const fetchSurveysList = async (): Promise<Array<SurveyEditionDescription>> => {
    const key = "surveys_description_list"
    return await fromSurveysCache(
        key,
        () => fetchSurveysListGithub()
    )
}

export async function fetchSurveyFromId(surveyId: SurveyEdition["surveyId"]) {
    const key = `survey_from_id_${surveyId}`
    return await fromSurveysCache(
        key,
        () => fetchSurveyFromIdGithub(surveyId)
    )
}


export async function fetchSurveyContext(slug: SurveySharedContext["slug"]): Promise<SurveySharedContext> {
    const key = `survey_context_${slug}`
    return await fromSurveysCache(
        key,
        () => fetchSurveyContextGithub(slug)
    )
}