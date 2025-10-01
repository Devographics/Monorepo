import { COUNT, CUTOFF_ANSWERS } from '@devographics/constants'
import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import { BucketUnits } from '@devographics/types'
import { isSpecialBucket } from './limit_data'
import { mergeBuckets } from './mergeBuckets'

/*

Group together any bucket that didn't make cutoff. 

*/
export function groupUnderCutoff<T extends Bucket | FacetBucket>({
    buckets,
    primaryAxis,
    secondaryAxis,
    isFacetBuckets
}: {
    buckets: T[]
    primaryAxis: ComputeAxisParameters
    secondaryAxis?: ComputeAxisParameters
    isFacetBuckets?: boolean
}) {
    const { cutoff, cutoffPercent } = primaryAxis
    const keptBuckets = buckets.filter(b => keepBucket<T>(b, cutoff, cutoffPercent, isFacetBuckets))
    const cutoffBuckets = buckets.filter(b => !keptBuckets.map(b => b.id).includes(b.id))
    if (cutoffBuckets.length > 0) {
        const cutoffGroupBucket = mergeBuckets<T>({
            buckets: cutoffBuckets,
            mergedProps: {
                id: CUTOFF_ANSWERS,
                groupedBucketIds: cutoffBuckets.map(b => b.id),
                groupedBuckets: cutoffBuckets
            },
            isFacetBuckets,
            primaryAxis,
            secondaryAxis
        })

        return cutoffBuckets.length > 0 ? [...keptBuckets, cutoffGroupBucket] : keptBuckets
    } else {
        return buckets
    }
}

export async function cutoffData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    if ((axis1.cutoff && axis1.cutoff > 1) || axis1.cutoffPercent || axis2?.cutoffPercent) {
        for (let editionData of resultsByEdition) {
            // first, limit regular buckets
            /* 
                
            WARNING: when aggregations are sorted along
            predefined options, applying cutoff can result in unexpectedly missing buckets
            (ex: missing "#2" bucket in "rank satisfaction from 1 to 5" question)
            
            Disable cutoff on a case-by-case basis.
            
            */
            // group together all buckets that don't make cutoff
            editionData.buckets = groupUnderCutoff<Bucket>({
                buckets: editionData.buckets,
                primaryAxis: axis1,
                secondaryAxis: axis2
            })

            if (axis2) {
                // then, cutoff facetBuckets if they exist
                // note: we cutoff facets even when sorted by options to avoid
                // having e.g. 200+ country facets even when most of them are empty
                for (let bucket of editionData.buckets) {
                    // group together all buckets that don't make cutoff
                    bucket.facetBuckets = groupUnderCutoff<FacetBucket>({
                        buckets: bucket.facetBuckets,
                        primaryAxis: axis2,
                        isFacetBuckets: true
                    })
                }
            }
        }
    }
}

/*

Note: When deciding whether to keep a regular bucket based on cutoffPercent
 we look at its PERCENTAGE_QUESTION, but when it's a facetBucket we look
 at its PERCENTAGE_BUCKET.

*/
const keepBucket = <T extends Bucket | FacetBucket>(
    bucket: T,
    cutoff: number,
    cutoffPercent?: number,
    isFacetBucket: boolean = false
) => {
    if (cutoffPercent) {
        // use cutoffPercent if specified
        const percentUnit = isFacetBucket
            ? BucketUnits.PERCENTAGE_BUCKET
            : BucketUnits.PERCENTAGE_QUESTION
        return isSpecialBucket(bucket) || (bucket[percentUnit] || 0) >= cutoffPercent
    } else {
        // else use regular count-based cutoff
        return isSpecialBucket(bucket) || (bucket[COUNT] || 0) >= cutoff
    }
}
