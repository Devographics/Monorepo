import { CUTOFF_ANSWERS, NO_ANSWER } from '@devographics/constants'
import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import isNil from 'lodash/isNil.js'
import sumBy from 'lodash/sumBy.js'
import { combineFacetBuckets } from './group_buckets'

/*

Group together any bucket that didn't make cutoff. 

*/
export function groupUnderCutoff<T extends Bucket | FacetBucket>(
    buckets: T[],
    cutoff: number,
    axis?: ComputeAxisParameters
) {
    const mainBuckets = buckets.filter(b => (b.count && b.count >= cutoff) || b.id === NO_ANSWER)
    const cutoffBuckets = buckets.filter(b => b.count && b.count < cutoff && b.id !== NO_ANSWER)
    const cutoffGroupBucket = {
        count: sumBy(cutoffBuckets, b => b.count || 0),
        id: CUTOFF_ANSWERS,
        percentageQuestion: sumBy(cutoffBuckets, b => b.percentageQuestion || 0),
        percentageSurvey: sumBy(cutoffBuckets, b => b.percentageSurvey || 0)
    } as T
    if (axis) {
        // if axis is provided, we know it's a top-level Bucket and not a FacetBucket
        ;(cutoffGroupBucket as Bucket).facetBuckets =
            combineFacetBuckets(cutoffBuckets as Bucket[], axis) ?? []
    }

    return [...mainBuckets, cutoffGroupBucket]
}

export async function cutoffData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    if (axis1.cutoff && axis1.cutoff > 1) {
        for (let editionData of resultsByEdition) {
            // first, limit regular buckets
            if (axis1.sort !== 'options') {
                // do not apply cutoffs for aggregations that are sorted along predefined options,
                // as that might result in unexpectedly missing buckets
                if (axis1.groupUnderCutoff) {
                    // group together all buckets that don't make cutoff
                    editionData.buckets = groupUnderCutoff<Bucket>(
                        editionData.buckets,
                        axis1.cutoff,
                        axis2
                    )
                } else {
                    // else, just filter out buckets under cutoff
                    editionData.buckets = editionData.buckets.filter(
                        bucket =>
                            isNil(bucket.count) ||
                            bucket.count! >= axis1.cutoff ||
                            bucket.id === NO_ANSWER
                    )
                }
            }

            if (axis2 && axis2.sort !== 'options') {
                // then, limit facetBuckets if they exist
                for (let bucket of editionData.buckets) {
                    if (axis2.groupUnderCutoff) {
                        // group together all buckets that don't make cutoff
                        bucket.facetBuckets = groupUnderCutoff<FacetBucket>(
                            bucket.facetBuckets,
                            axis1.cutoff
                        )
                    } else {
                        // else, just filter out buckets under cutoff
                        bucket.facetBuckets = bucket.facetBuckets.filter(
                            bucket =>
                                isNil(bucket.count) ||
                                bucket.count! >= axis1.cutoff ||
                                bucket.id === NO_ANSWER
                        )
                    }
                }
            }
        }
    }
}
