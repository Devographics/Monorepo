import { ResponseEditionData, ComputeAxisParameters } from '../../types'
import { mergeBuckets } from './mergeBuckets'
import {
    CUTOFF_ANSWERS,
    NO_MATCH,
    OVERLIMIT_ANSWERS,
    OTHER_ANSWERS,
    INSUFFICIENT_DATA
} from '@devographics/constants'
import { Bucket, FacetBucket } from '../../types'

const otherBucketIds = [
    // NO_ANSWER, // do *not* group NO_ANSWER bucket with the other ones
    NO_MATCH,
    CUTOFF_ANSWERS,
    OTHER_ANSWERS,
    OVERLIMIT_ANSWERS,
    INSUFFICIENT_DATA
]
const isOtherBucket = (b: Bucket | FacetBucket) => otherBucketIds.includes(b.id)
const isNotOtherBucket = (b: Bucket | FacetBucket) => !isOtherBucket(b)

// ! Note: using this creates "groups of groups" (for example grouping cutoff data
// ! and off-limit data groups together)
export async function groupOtherBuckets(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        if (axis1.mergeOtherBuckets) {
            const regularBuckets = editionData.buckets.filter(isNotOtherBucket)
            const specialBuckets = editionData.buckets.filter(isOtherBucket)

            if (specialBuckets.length > 0) {
                const combinedOtherBucket = mergeBuckets({
                    buckets: specialBuckets,
                    mergedProps: { id: OTHER_ANSWERS },
                    primaryAxis: axis1,
                    secondaryAxis: axis2
                })

                editionData.buckets = [...regularBuckets, combinedOtherBucket]
            }
        }
        if (axis2?.mergeOtherBuckets) {
            // then, limit facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                const regularBuckets = bucket.facetBuckets.filter(isNotOtherBucket)
                const specialBuckets = bucket.facetBuckets.filter(isOtherBucket)

                if (specialBuckets.length > 0) {
                    const combinedOtherBucket = mergeBuckets({
                        buckets: specialBuckets,
                        mergedProps: { id: OTHER_ANSWERS },
                        primaryAxis: axis1,
                        secondaryAxis: axis2,
                        isFacetBuckets: true
                    })

                    bucket.facetBuckets = [...regularBuckets, combinedOtherBucket]
                }
            }
        }
    }
}
