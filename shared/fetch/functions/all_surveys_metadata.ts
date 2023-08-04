import { SurveyMetadata } from '@devographics/types'
import { surveysMetadataCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { getSurveysQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

const filterSurveys = (surveys: SurveyMetadata[], options: FetcherFunctionOptions = {}) => {
    const { serverConfig } = options
    let filteredSurveys = surveys
    if (serverConfig && serverConfig().isProd && !serverConfig()?.isTest) {
        filteredSurveys = surveys?.filter(s => s.id !== 'demo_survey')
    }
    return filteredSurveys
}

/**
 * Fetch metadata for all surveys
 * @returns
 */

export const fetchSurveysMetadata = async (options?: FetcherFunctionOptions) => {
    const getQuery = options?.getQuery || getSurveysQuery
    const query = getQuery()
    const key = surveysMetadataCacheKey(options)
    const result = await getFromCache<Array<SurveyMetadata>>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({ query, key })
            if (!result) throw new Error(`Couldn't fetch surveys`)
            return filterSurveys(result._metadata.surveys, options) as SurveyMetadata[]
        },
        ...options
    })
    return result
}
