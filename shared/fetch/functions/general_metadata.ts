import { GeneralMetadata, SurveyMetadata } from '@devographics/types'
import { generalMetadataCacheKey, surveysMetadataCacheKey } from '../cache_keys'
import { fetchGraphQLApi, getFromCache } from '../fetch'
import { getSurveysQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'
import { getCacheOption } from '../helpers'
import { getGeneralMetadataQuery } from '../queries/general_metadata'

/**
 * Fetch metadata for all surveys
 * @returns
 */
export const fetchGeneralMetadata = async (options?: FetcherFunctionOptions) => {
    const getQuery = options?.getQuery || getGeneralMetadataQuery
    const query = getQuery()
    const key = generalMetadataCacheKey(options)
    const result = await getFromCache<Array<GeneralMetadata>>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({ query, key, cache: getCacheOption() })
            if (!result) throw new Error(`Couldn't fetch general metadata`)
            const generalMetadata = result._metadata.general as GeneralMetadata[]
            return generalMetadata
        },
        ...options
    })
    return result
}
