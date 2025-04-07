import { BucketUnits } from '@devographics/types'
import { getEntityFragment } from './getEntityFragment'
import { getFacetFragment } from './getFacetFragment'
import { getPercentilesFragment } from './getPercentilesFragment'
import { QueryArgs } from '../types'

export const getBucketsFragment = (options: {
    addBucketsEntities: boolean
    queryArgs: QueryArgs
    addGroupedBuckets: boolean
    fieldName?: string
}): string => {
    const { addBucketsEntities, queryArgs, addGroupedBuckets, fieldName = 'buckets' } = options
    const { facet } = queryArgs
    return `${fieldName} {
                    count
                    id
                    value
                    percentageQuestion
                    percentageSurvey
                    isFreeformData
                    hasInsufficientData
                    ${addBucketsEntities ? getEntityFragment() : ''}
                    ${facet ? BucketUnits.AVERAGE : ''}
                    ${facet ? getPercentilesFragment() : ''}
                    ${facet ? getFacetFragment(addBucketsEntities) : ''}
                    ${
                        addGroupedBuckets
                            ? getBucketsFragment({
                                  ...options,
                                  fieldName: 'groupedBuckets',
                                  addGroupedBuckets: false
                              })
                            : ''
                    }
                }`
}
