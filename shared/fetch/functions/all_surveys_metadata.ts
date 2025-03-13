import { SurveyMetadata } from '@devographics/types'
import { surveysMetadataCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { getSurveysQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'
import { getCacheOption } from '../helpers'

/**
 * Fetch metadata for all surveys
 * @returns
 */
export const fetchSurveysMetadata = async (
    options?: FetcherFunctionOptions & { addCredits?: boolean }
) => {
    const addCredits = options?.addCredits
    const getQuery = options?.getQuery || getSurveysQuery
    const query = getQuery({ addCredits })
    const key = surveysMetadataCacheKey(options)
    const result = await getFromCache<Array<SurveyMetadata>>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({
                query,
                key,
                cache: getCacheOption()
            })
            if (!result) throw new Error(`Couldn't fetch surveys`)
            const surveys = result._metadata.surveys as SurveyMetadata[]
            return surveys
        },
        ...options
    })
    // edition should have a circular reference back to their survey
    if (result.data) {
        result.data = result.data.map(survey => ({
            ...survey,
            editions: survey.editions?.map(edition => ({ ...edition, survey }))
        }))
    }
    return result
}
