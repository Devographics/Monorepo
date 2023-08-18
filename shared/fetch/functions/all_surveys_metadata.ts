import { SurveyMetadata } from '@devographics/types'
import { surveysMetadataCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { getSurveysQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

const filterSurveys = (surveys: SurveyMetadata[], options: FetcherFunctionOptions = {}) => {
    const { getServerConfig } = options
    let filteredSurveys = surveys
    // in test or dev mode, the app can specify they want to keep the demo survey around
    if (getServerConfig) {
        const serverConfig = getServerConfig()
        if (!(serverConfig.isDev || serverConfig.isTest)) {
            filteredSurveys = surveys?.filter(s => s.id !== 'demo_survey')
        }
    } else {
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
            console.log("result", result._metadata.surveys.map(s => s.name))
            return filterSurveys(result._metadata.surveys, options) as SurveyMetadata[]
        },
        ...options
    })
    return result
}
