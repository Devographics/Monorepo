import { ResponseData, ResultsSubFieldEnum } from '@devographics/types'
import { getFromCache, fetchGraphQLApi } from '../fetch'
import { questionDataCacheKey } from '../cache_keys'
import { FetcherFunctionOptions } from '../types'
import { getQuestionDataQuery } from '../queries/question_data'

/**
 * Load a question's data
 * @returns
 */
export async function fetchQuestionData(
    options: FetcherFunctionOptions & {
        surveyId: string
        editionId: string
        sectionId: string
        questionId: string
        subField: ResultsSubFieldEnum
    }
) {
    const { appName, surveyId, editionId, sectionId, questionId, subField, calledFrom } = options
    const getQuery = options.getQuery || getQuestionDataQuery
    const queryOptions = {
        surveyId,
        editionId,
        sectionId,
        questionId,
        subField
    }
    const queryArgs = {}
    const query = getQuery({ queryOptions, queryArgs })

    if (!surveyId) {
        throw new Error(`surveyId not defined (calledFrom: ${calledFrom})`)
    }
    if (!editionId) {
        throw new Error(`editionId not defined (calledFrom: ${calledFrom})`)
    }
    const key = questionDataCacheKey({
        appName,
        surveyId,
        editionId,
        sectionId,
        questionId
    })
    return await getFromCache<ResponseData>({
        key,
        fetchFunction: async () => {
            const result = await fetchGraphQLApi({
                query,
                key
            })
            if (!result) {
                throw new Error(
                    `Couldn't fetch data for question ${questionId}, result: ${
                        result && JSON.stringify(result)
                    }`
                )
            }
            return result?.surveys?.[surveyId]?.[editionId]?.[sectionId]?.[questionId]?.[subField]
        },
        ...options
    })
}
