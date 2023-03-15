// TODO: feed the cache in surveyadmin

// Redis data fetching
// All methods will return null if data are not in the cache
// => use either a local or a github load when it happen
import { SurveyEdition, SurveyEditionDescription, SurveySharedContext } from "../typings";
import { getRedisClient } from "./redis";

// This TTL can be long (multiple hours) since we can manually invalidate Redis cache if needed
const TTL_SECONDS = 60 * 60 * 6

function storeRedis(key: string) {
    return async function <T = any>(val: T extends Promise<unknown> ? never : T): Promise<boolean> {
        const redisClient = getRedisClient()
        // EX = Expiration time in seconds
        const res = await redisClient.set(key, JSON.stringify(val), "EX", TTL_SECONDS);
        if (res !== "OK") {
            console.error("Can't store JSON into Redis, error:" + res)
            return false
        }
        return true
    }
}

async function fetchJson<T = any>(key: string): Promise<T | null> {
    const redisClient = getRedisClient()
    const str = await redisClient.get(key)
    if (!str) return null
    try {
        const json = JSON.parse(str)
        return json
    } catch (err) {
        redisClient.del(key).catch(err => {
            console.error(`Could not delete malformed Redis value for key ${key}`)
        })
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
export const storeSurveyRedis = (...args: Parameters<typeof surveyKey>) => storeRedis(surveyKey(...args))

const surveyListKey = `surveyform_surveys_descriptions`
/// Surveys list

export const fetchSurveysListRedis = async (): Promise<Array<SurveyEditionDescription> | null> => {
    let surveys = await fetchJson<Array<SurveyEditionDescription>>(surveyListKey)
    return surveys
}
export const storeSurveysListRedis = storeRedis(surveyListKey)

// prettySlug is the one from the URL
export async function fetchSurveyContextRedis(slug: SurveySharedContext["slug"]): Promise<SurveySharedContext> {
    const surveyContext = await fetchJson(surveyContextKey(slug))
    return surveyContext
}
export const storeSurveyContextRedis = (...args: Parameters<typeof surveyContextKey>) => storeRedis(surveyContextKey(...args))