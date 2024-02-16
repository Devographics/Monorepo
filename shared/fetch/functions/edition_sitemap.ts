import { EditionMetadata } from '@devographics/types'
import { getFromCache, fetchGraphQLApi } from '../fetch'
import { editionSitemapCacheKey } from '../cache_keys'
import { getEditionSitemapQuery } from '../queries'
import { FetcherFunctionOptions } from '../types'

/**
 * Survey edition, including the sitemap object
 */
export async function fetchEditionSitemap(
    options: FetcherFunctionOptions & {
        surveyId: string
        editionId: string
    }
) {
    const { appName, surveyId, editionId, calledFrom } = options
    const getQuery = options.getQuery || getEditionSitemapQuery
    const query = getQuery({ editionId })
    if (!surveyId) {
        throw new Error(`surveyId not defined (calledFrom: ${calledFrom})`)
    }
    if (!editionId) {
        throw new Error(`editionId not defined (calledFrom: ${calledFrom})`)
    }
    const key = editionSitemapCacheKey({
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
                    `Couldn't fetch survey ${editionId}, result: ${result && JSON.stringify(result)
                    }`
                )
            }
            return result._metadata.surveys[0].editions[0]
        },
        ...options
    })
}
