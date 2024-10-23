import { getBucketFragment } from './getBucketFragment'
import { DataQueryConfig, argumentsPlaceholder, getQueryArgsString } from '../queries'
import { getEntityFragment } from './getEntityFragment'
import { getCommentsCountFragment } from './getCommentsCountFragment'
import { getResponseMetadataFragment } from './getResponseMetadataFragment'

const allEditionsFragment = `editionId
  year`

export const getDefaultQueryFragment = ({
    queryOptions,
    queryArgs = {}
}: {
    queryOptions: any
    queryArgs: DataQueryConfig
}) => {
    const {
        surveyId,
        editionId,
        sectionId,
        questionId,
        fieldId,
        subField = 'responses',
        addBucketsEntities = true,
        allEditions = false,
        addArgumentsPlaceholder = false,
        addBucketFacetsPlaceholder = false,
        addQuestionEntity = false,
        addQuestionComments = true,
        addGroupedBuckets = false
    } = queryOptions

    const queryArgsString = addArgumentsPlaceholder
        ? argumentsPlaceholder
        : getQueryArgsString(queryArgs)
    const editionType = allEditions ? 'allEditions' : 'currentEdition'

    const questionIdString = fieldId ? `${questionId}: ${fieldId}` : questionId

    return `
surveys {
  ${surveyId} {
    ${editionId} {
      ${sectionId} {
        ${questionIdString} {
          ${addQuestionEntity ? getEntityFragment() : ''}
          ${addQuestionComments ? getCommentsCountFragment() : ''}
          ${subField}${queryArgsString} {
            ${editionType} {
              ${getResponseMetadataFragment()}
              ${allEditions ? allEditionsFragment : ''}
              completion {
                count
                percentageSurvey
                total
              }
              average
              percentiles {
                p50
              }
              buckets {
                ${getBucketFragment({
                    addBucketFacetsPlaceholder,
                    addBucketsEntities,
                    addGroupedBuckets,
                    queryArgs
                })}
              }
            }
          }
        }
      }
    }
  }
}
`
}
