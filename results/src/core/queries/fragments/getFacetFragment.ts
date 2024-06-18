import { getEntityFragment } from './getEntityFragment'

export const getFacetFragment = (addBucketsEntities?: boolean) => `
    facetBuckets {
        id
        count
        percentageBucket
        percentageQuestion
        hasInsufficientData
        ${addBucketsEntities ? getEntityFragment() : ''}
    }
`
