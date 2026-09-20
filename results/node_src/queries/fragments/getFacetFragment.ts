import { getEntityFragment } from './getEntityFragment'
import { getTokenFragment } from './getTokenFragment'

export const getFacetFragment = (addBucketsEntities?: boolean) => `
    facetBuckets {
        id
        count
        value
        percentageBucket
        percentageQuestion
        hasInsufficientData
        ${addBucketsEntities ? getEntityFragment() : ''}
        ${addBucketsEntities ? getTokenFragment() : ''}
    }
`
