import { getBucketsFragment } from './getBucketsFragment'
import { getCommentsCountFragment } from './getCommentsCountFragment'
import { getEntityFragment } from './getEntityFragment'
import { QueryOptions, SeriesParams } from '../types'
import { getQueryArgsString } from '../helpers'
import { getAllEditionsFragment } from './getAllEditionsFragment'
import { getRatiosFragment } from './getRatiosFragment'
import { SENTIMENT_FACET } from '@devographics/constants'
import { getResponseMetadataFragment } from './getResponseMetadataFragment'

export const getSerieFragment = ({
    queryOptions,
    serie
}: {
    queryOptions: QueryOptions
    serie: SeriesParams
}) => {
    const { name, queryArgs } = serie
    const {
        questionId,
        subField = 'responses',
        addBucketsEntities = true,
        allEditions = false,
        addQuestionEntity = false,
        addQuestionComments = true,
        addBuckets = true,
        addRatios = false,
        addGroupedBuckets = false
    } = queryOptions

    // for ratios to work, the facet needs to be "_sentiment"
    if (addRatios) {
        queryArgs.facet = { id: SENTIMENT_FACET }
    }

    const queryArgsString = getQueryArgsString(queryArgs)
    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    const questionIdString = name ? `${name}: ${questionId}` : questionId

    return `
        ${questionIdString} {
            id
            ${addQuestionEntity ? getEntityFragment() : ''}
            ${addQuestionComments ? getCommentsCountFragment() : ''}
            ${subField}${queryArgsString} {
            ${editionType} {
                ${getResponseMetadataFragment()}
                ${allEditions ? getAllEditionsFragment() : ''}
                completion {
                    count
                    percentageSurvey
                    total
                }
                average
                percentiles {
                    p50
                }
                ${addRatios ? getRatiosFragment() : ''}
                ${
                    addBuckets
                        ? getBucketsFragment({
                              addBucketsEntities,
                              addGroupedBuckets,
                              queryArgs
                          })
                        : ''
                }
            }
            }
        }`
}
