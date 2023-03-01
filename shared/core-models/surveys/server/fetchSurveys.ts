/**
 * 1) get from in-memory cache if available (short TTL because it can't be emptied)
 * 2) get from Redis if available (longer TTL, can be invalidated/updated easily)
 * 3) get from Github in last resort
 */
import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from "../typings";
import NodeCache from 'node-cache'
import {
    fetchSurveyContextGithub,
    fetchSurveyGithub, fetchSurveysListGithub
} from "./fetchGithub";
import { fetchSurveyContextRedis, fetchSurveyRedis, fetchSurveysListRedis, storeSurveyContextRedis, storeSurveyRedis, storeSurveysListRedis } from "./fetchRedis";
import orderBy from "lodash/orderBy.js"

const surveysCache = new NodeCache({
    // This TTL must stay short, because we manually invalidate this cache
    stdTTL: 5 * 60, // in seconds
    // needed for caching promises
    useClones: false
})

async function fromSurveysCache<T = any>(key: string, fetchFunc: () => Promise<T>) {
    if (surveysCache.has(key)) {
        console.debug("in-memory cache hit", key)
        const res = await surveysCache.get<Promise<T>>(key)!
        return res
    }
    console.debug("in-memory cache miss", key)
    const promise = fetchFunc()
    surveysCache.set(key, promise)
    return await promise
}

export async function fetchSurvey(prettySlug: SurveyEdition["prettySlug"], year: string): Promise<SurveyEdition> {
    const key = `survey_${prettySlug}_promise`
    return await fromSurveysCache(
        key,
        async () => {
            const redisSurvey = await fetchSurveyRedis(prettySlug, year)
            if (redisSurvey) {
                console.debug("redis cache hit", prettySlug, year)
                return redisSurvey
            }
            console.debug("redis cache miss, fetching from github")
            const ghSurvey = await fetchSurveyGithub(prettySlug, year)
            // store in Redis in the background
            storeSurveyRedis(prettySlug, year)(ghSurvey).catch(err => {
                console.error("couldn't store survey in Redis", err)
            })
            return ghSurvey
        }
    )
}

export const fetchSurveysList = async (): Promise<Array<SurveyEditionDescription>> => {
    const key = "surveys_description_list"
    let surveys = await fromSurveysCache(
        key,
        async () => {
            const redisSurveys = await fetchSurveysListRedis()
            if (redisSurveys) {
                return redisSurveys
            }
            const ghSurveys = await fetchSurveysListGithub()
            storeSurveysListRedis(ghSurveys)
            return ghSurveys
        }
    )
    if (process.env.NODE_ENV !== "development") {
        surveys = surveys.filter(s => s.slug !== "demo_survey")
    }
    const sorted = orderBy(surveys, ["year", "slug"], ["desc", "asc"])
    return sorted
}

export async function fetchSurveyFromId(surveyId: SurveyEdition["surveyId"]) {
    // no need to cache this functions, 
    // because it is derived from other functions that are themselves cached
    const surveyList = await fetchSurveysList()
    const surveyDescription = surveyList.find(s => s.surveyId)
    if (!surveyDescription) {
        throw new Error(`No survey with surveyId ${surveyId}`)
    }
    const survey = await fetchSurvey(surveyDescription.slug, surveyDescription.year + "")
    return survey
}


export async function fetchSurveyContext(slug: SurveySharedContext["slug"]): Promise<SurveySharedContext> {
    const key = `survey_context_${slug}`
    return await fromSurveysCache(
        key,
        async () => {
            const redisSurvey = await fetchSurveyContextRedis(slug)
            if (redisSurvey) {
                return redisSurvey
            }
            const ghSurvey = await fetchSurveyContextGithub(slug)
            storeSurveyContextRedis(slug)(ghSurvey)
            return ghSurvey
        }
    )
}