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

export async function fetchSurvey(surveyContextId: SurveyEdition["surveyContextId"], year: string): Promise<SurveyEdition> {
    const key = `survey_${surveyContextId}_promise`
    return await fromSurveysCache(
        key,
        async () => {
            const redisSurvey = await fetchSurveyRedis(surveyContextId, year)
            if (redisSurvey) {
                console.debug("redis cache hit", surveyContextId, year)
                return redisSurvey
            }
            console.debug("redis cache miss,", surveyContextId, year, "fetching from github")
            const ghSurvey = await fetchSurveyGithub(surveyContextId, year)
            // store in Redis in the background
            storeSurveyRedis(surveyContextId, year)(ghSurvey).catch(err => {
                console.error("couldn't store survey in Redis", err)
            })
            return ghSurvey
        }
    )
}

export const fetchSurveysList = async (keepDemo?: boolean): Promise<Array<SurveyEditionDescription>> => {
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
    // NOTE: we cannot systematically override "NODE_ENV" with test,
    // so we have to use a custom node_env variable NEXT_PUBLIC_NODE_ENV
    console.log("ENV", process.env.NODE_ENV, process.env.NEXT_PUBLIC_NODE_ENV)
    if (!keepDemo) {
        surveys = surveys.filter(s => s.surveyContextId !== "demo_survey")
    }
    const sorted = orderBy(surveys, ["year", "surveyContextId"], ["desc", "asc"])
    return sorted
}

/**
 * Functions that gets a safe unique id per survey edition,
 * taking legacy fields into account
 * @param survey 
 * @returns js2022, graphql2022, css2022 etc.
 */
export function getSurveyEditionId(survey: SurveyEdition) {
    // js2022 etc.
    const surveyEditionId = survey.surveyEditionId || survey.id || survey.surveyId || survey.slug
    return surveyEditionId
}
export function getSurveyPrettySlug(survey: SurveyEdition) {
    return survey.surveyContextId.replaceAll("_", "-")
}
export async function fetchSurveyFromId(surveyEditionId: SurveyEdition["surveyEditionId"]) {
    // no need to cache this functions, 
    // because it is derived from other functions that are themselves cached
    // (always get demo survey here, we filter afterward)
    const surveyList = await fetchSurveysList(true)
    const surveyDescription = surveyList.find(s => s.surveyEditionId === surveyEditionId)
    if (!surveyDescription) {
        throw new Error(`No survey with surveyId ${surveyEditionId}`)
    }
    // state_of_js
    const survey = await fetchSurvey(surveyDescription.surveyContextId, surveyDescription.year + "")
    return survey
}


export async function fetchSurveyContext(surveyContextId: SurveySharedContext["id"]): Promise<SurveySharedContext> {
    const key = `survey_context_${surveyContextId}`
    return await fromSurveysCache(
        key,
        async () => {
            const redisSurvey = await fetchSurveyContextRedis(surveyContextId)
            if (redisSurvey) {
                return redisSurvey
            }
            const ghSurvey = await fetchSurveyContextGithub(surveyContextId)
            storeSurveyContextRedis(surveyContextId)(ghSurvey)
            return ghSurvey
        }
    )
}