// TODO: feed the cache in surveyadmin

// Redis data fetching
// All methods will return null if data are not in the cache
// => use either a local or a github load when it happen
import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from "../typings";
import orderBy from "lodash/orderBy.js"
import { getRedisClient } from "./redis";


async function fetchJson<T = any>(key: string): Promise<T | null> {
    const redisClient = getRedisClient()
    const str = await redisClient.get(key)
    if (!str) return null
    try {
        const json = JSON.parse(str)
        return json
    } catch (err) {
        throw new Error(`Malformed value in Redis cache ${key}}: ${str}`)
    }
}

const prefix = "surveyform"

const surveyKey = (prettySlug: SurveyEdition["prettySlug"], year: string) => `${prefix}_survey_${prettySlug}_${year}`

const surveyContextKey = (slug: SurveySharedContext["slug"]) => `${prefix}_surveycontext_${slug}`

/**
 * @param slug Slug of the survey from URL
 * /!\ this is different from the github folder path, we need to replace "-" by "_"
 * @param year 
 */
export async function fetchSurveyRedis(prettySlug: SurveyEdition["prettySlug"], year: string): Promise<SurveyEdition | null> {
    const survey = fetchJson<SurveyEdition>(surveyKey(prettySlug, year))
    return survey
}


const surveyListKey = `surveyform_surveys_descriptions`
/// Surveys list

export const fetchSurveysListRedis = async (): Promise<Array<SurveyEditionDescription> | null> => {
    let surveys = await fetchJson<Array<SurveyEditionDescription>>(surveyListKey)
    if (!surveys) return null
    if (process.env.NODE_ENV !== "development") {
        surveys = surveys.filter(s => s.slug !== "demo_survey")
    }
    const sorted = orderBy(surveys, ["year", "slug"], ["desc", "asc"])
    return sorted
}

// prettySlug is the one from the URL
export async function fetchSurveyContextRedis(slug: SurveySharedContext["slug"]): Promise<SurveySharedContext> {
    const surveyContext = await fetchJson(surveyContextKey(slug))
    return surveyContext
}

export async function fetchSurveyFromIdRedis(surveyId: SurveyEdition["surveyId"]) {
    const surveyList = await fetchSurveysListRedis()
    if (!surveyList) return null
    const surveyDescription = surveyList.find(s => s.surveyId)
    if (!surveyDescription) {
        throw new Error(`No survey with surveyId ${surveyId}`)
    }
    const survey = await fetchSurveyRedis(surveyDescription.slug, surveyDescription.year + "")
    return survey
}