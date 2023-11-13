import { CUTOFF_ANSWERS, NO_ANSWER, OTHER_ANSWERS } from '@devographics/constants'
import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import take from 'lodash/take.js'

const specialBucketIds = [NO_ANSWER, CUTOFF_ANSWERS, OTHER_ANSWERS]
const isSpecialBucket = (b: Bucket | FacetBucket) => specialBucketIds.includes(b.id)
const isNotSpecialBucket = (b: Bucket | FacetBucket) => !isSpecialBucket(b)

/*

Only apply the limit to "regular" buckets 
(e.g. not the NO_ANSWER, CUTOFF_ANSWERS, etc. buckets)

*/
function limitBuckets<T extends Bucket | FacetBucket>(buckets: T[], limit: number) {
    const regularBuckets = buckets.filter(isNotSpecialBucket)
    const specialBuckets = buckets.filter(isSpecialBucket)
    const regularBucketsLimited = take(regularBuckets, limit)
    return [...regularBucketsLimited, ...specialBuckets]
}

export async function limitData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        // first, limit regular buckets
        if (axis1.sort !== 'options' && axis1.limit !== 0) {
            // do not apply limits for aggregations that are sorted along predefined options,
            // as that might result in unexpectedly missing buckets
            editionData.buckets = limitBuckets<Bucket>(editionData.buckets, axis1.limit)
        }

        if (axis2 && axis2.sort !== 'options' && axis2.limit !== 0) {
            // then, limit facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = limitBuckets<FacetBucket>(bucket.facetBuckets, axis2.limit)
            }
        }
    }
}
