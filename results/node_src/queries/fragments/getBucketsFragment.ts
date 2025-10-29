import { BucketUnits } from '../imports'
import { getEntityFragment } from './getEntityFragment'
import { getFacetFragment } from './getFacetFragment'
import { getPercentilesFragment } from './getPercentilesFragment'
import { QueryArgs } from '../types'

const MAX_DEPTH = 3

export const getBucketsFragment = (options: {
    addBucketsEntities: boolean
    queryArgs: QueryArgs
    addGroupedBuckets: boolean
    fieldName?: string
    currentDepth: number
}): string => {
    const {
        addBucketsEntities,
        queryArgs,
        addGroupedBuckets,
        fieldName = 'buckets',
        currentDepth
    } = options
    const { facet } = queryArgs
    return `${fieldName} {
                    count
                    id
                    value
                    index
                    percentageQuestion
                    percentageSurvey
                    isFreeformData
                    hasInsufficientData
                    ${addBucketsEntities ? getEntityFragment() : ''}
                    ${facet ? BucketUnits.AVERAGE : ''}
                    ${facet ? getPercentilesFragment() : ''}
                    ${facet ? getFacetFragment(addBucketsEntities) : ''}
                    ${
                        addGroupedBuckets && currentDepth < MAX_DEPTH
                            ? getBucketsFragment({
                                  ...options,
                                  fieldName: 'groupedBuckets',
                                  addGroupedBuckets: true,
                                  currentDepth: currentDepth + 1
                              })
                            : ''
                    }
                }`
}
