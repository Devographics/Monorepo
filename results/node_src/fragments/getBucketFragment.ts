import { getEntityFragment } from './getEntityFragment'
import { getPercentilesFragment } from './getPercentilesFragment'
import { getFacetFragment } from './getFacetFragment'
import { bucketFacetsPlaceholder, QueryArgs } from '../queries'

const BucketUnits = {
    AVERAGE: 'averageByFacet'
}

export const getBucketFragment = (options: {
    addBucketsEntities: boolean
    addBucketFacetsPlaceholder: boolean
    queryArgs: QueryArgs
    addGroupedBuckets: boolean
}): string => {
    const { addBucketsEntities, addBucketFacetsPlaceholder, queryArgs, addGroupedBuckets } = options
    const { facet } = queryArgs
    return `
                    count
                    id
                    percentageQuestion
                    percentageSurvey
                    isFreeformData
                    hasInsufficientData
                    ${addBucketsEntities ? getEntityFragment() : ''}
                    ${facet || addBucketFacetsPlaceholder ? BucketUnits.AVERAGE : ''}
                    ${facet || addBucketFacetsPlaceholder ? getPercentilesFragment() : ''}
                    ${facet ? getFacetFragment(addBucketsEntities) : ''}
                    ${addBucketFacetsPlaceholder ? bucketFacetsPlaceholder : ''}
                    ${
                        addGroupedBuckets
                            ? `groupedBuckets {
                        ${getBucketFragment({ ...options, addGroupedBuckets: false })}
                    }
                    `
                            : ''
                    }
`
}
