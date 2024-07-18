import {
    CUTOFF_ANSWERS,
    NO_ANSWER,
    NO_MATCH,
    OTHER_ANSWERS,
    OVERLIMIT_ANSWERS
} from '@devographics/constants'
import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import take from 'lodash/take.js'
import { mergeBuckets } from './mergeBuckets'

export const specialBucketIds = [
    NO_ANSWER,
    NO_MATCH,
    CUTOFF_ANSWERS,
    OTHER_ANSWERS,
    OVERLIMIT_ANSWERS
]
export const isSpecialBucket = (b: Bucket | FacetBucket) => specialBucketIds.includes(b.id)
export const isNotSpecialBucket = (b: Bucket | FacetBucket) => !isSpecialBucket(b)

/*

Group together any bucket that went over the limit. 

*/
export function groupOverLimit<T extends Bucket | FacetBucket>({
    buckets,
    limit,
    isFacetBuckets,
    primaryAxis,
    secondaryAxis
}: {
    buckets: T[]
    limit: number
    isFacetBuckets?: boolean
    primaryAxis: ComputeAxisParameters
    secondaryAxis?: ComputeAxisParameters
}) {
    const { limitedBuckets, discardedBuckets } = limitBuckets<T>({ buckets, limit })
    if (discardedBuckets.length > 0) {
        const overlimitGroupBucket = mergeBuckets({
            buckets: discardedBuckets,
            mergedProps: { id: OVERLIMIT_ANSWERS },
            isFacetBuckets,
            primaryAxis,
            secondaryAxis
        })

        return discardedBuckets.length > 0
            ? [...limitedBuckets, overlimitGroupBucket]
            : limitedBuckets
    } else {
        return buckets
    }
}

/*

Only apply the limit to "regular" buckets 
(e.g. not the NO_ANSWER, CUTOFF_ANSWERS, etc. buckets)

*/
function limitBuckets<T extends Bucket | FacetBucket>({
    buckets,
    limit
}: {
    buckets: T[]
    limit: number
}) {
    const regularBuckets = buckets.filter(isNotSpecialBucket)
    const specialBuckets = buckets.filter(isSpecialBucket)
    const regularBucketsLimited = take(regularBuckets, limit)
    const limitedBuckets = [...regularBucketsLimited, ...specialBuckets]
    // discarded buckets are any buckets whose id is not included in limitedBuckets
    const discardedBuckets = buckets.filter(b => !limitedBuckets.map(b => b.id).includes(b.id))
    return { limitedBuckets, discardedBuckets }
}

export async function limitData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        // first, limit regular buckets
        if (axis1.sort !== 'options' && axis1.limit && axis1.limit !== 0) {
            if (axis1.groupOverLimit) {
                // group together all buckets that don't make cutoff
                editionData.buckets = groupOverLimit<Bucket>({
                    buckets: editionData.buckets,
                    limit: axis1.limit,
                    primaryAxis: axis1,
                    secondaryAxis: axis2
                })
            } else {
                // do not apply limits for aggregations that are sorted along predefined options,
                // as that might result in unexpectedly missing buckets
                const { limitedBuckets } = limitBuckets<Bucket>({
                    buckets: editionData.buckets,
                    limit: axis1.limit
                })
                editionData.buckets = limitedBuckets
            }
        }

        if (axis2 && axis2.sort !== 'options' && axis2.limit && axis2.limit !== 0) {
            // then, limit facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                if (axis2.groupOverLimit) {
                    // group together all buckets that don't make cutoff
                    bucket.facetBuckets = groupOverLimit<FacetBucket>({
                        buckets: bucket.facetBuckets,
                        isFacetBuckets: true,
                        primaryAxis: axis2,
                        limit: axis2.limit
                    })
                } else {
                    const { limitedBuckets } = limitBuckets<FacetBucket>({
                        buckets: bucket.facetBuckets,
                        limit: axis2.limit
                    })
                    bucket.facetBuckets = limitedBuckets
                }
            }
        }
    }
}
