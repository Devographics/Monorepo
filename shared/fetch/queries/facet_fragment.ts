import { getEntityFragment } from './entity_fragment'

export const getFacetFragment = addEntities => `
    facetBuckets {
        id
        count
        percentageQuestion
        percentageSurvey
        percentageBucket
        ${addEntities ? getEntityFragment() : ''}
    }
`
