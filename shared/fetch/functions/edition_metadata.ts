import { EditionMetadata } from '@devographics/types'
import { getFromCache, fetchGraphQLApi } from '../fetch'
import { editionMetadataCacheKey } from '../cache_keys'
import { getEditionMetadataQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

/**
 * Load the metadata of a survey edition for the surveyform app
 * @returns
 */
export async function fetchEditionMetadata(
    options: FetcherFunctionOptions & {
        surveyId: string
        editionId: string
    }
) {
    const { appName, surveyId, editionId, calledFrom } = options
    const getQuery = options.getQuery || getEditionMetadataQuery
    const query = getQuery({ editionId })
    if (!surveyId) {
        throw new Error(`surveyId not defined (calledFrom: ${calledFrom})`)
    }
    if (!editionId) {
        throw new Error(`editionId not defined (calledFrom: ${calledFrom})`)
    }
    const key = editionMetadataCacheKey({
        appName,
        surveyId,
        editionId
    })
    return await getFromCache<EditionMetadata>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({
                query,
                key
            })
            if (!result) {
                throw new Error(
                    `Couldn't fetch survey ${editionId}, result: ${
                        result && JSON.stringify(result)
                    }`
                )
            }
            return result._metadata.surveys[0].editions[0]
        },
        ...options
    })
}
