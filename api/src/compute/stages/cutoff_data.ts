import { CUTOFF_ANSWERS, NO_ANSWER } from '@devographics/constants'
import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import isNil from 'lodash/isNil.js'
import sum from 'lodash/sum.js'
import sumBy from 'lodash/sumBy.js'
import compact from 'lodash/compact.js'
import round from 'lodash/round.js'
import { combineFacetBuckets } from './group_buckets'
import { PercentileData, Percentiles } from '@devographics/types'

function mergePercentiles(buckets: Bucket[] | FacetBucket[]) {
    const percentileKeys = ['p0', 'p25', 'p50', 'p75', 'p100'] as Percentiles[]
    const percentiles = {} as PercentileData
    for (const key of percentileKeys) {
        const values = compact(buckets.map(b => b?.percentilesByFacet?.[key]))
        percentiles[key] = round(sum(values) / buckets.length, 2)
    }
    return percentiles
}
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
        percentageQuestion: round(
            sumBy(cutoffBuckets, b => b.percentageQuestion || 0),
            2
        ),
        percentageSurvey: round(
            sumBy(cutoffBuckets, b => b.percentageSurvey || 0),
            2
        ),
        groupedBucketIds: cutoffBuckets.map(b => b.id),
        averageByFacet: round(
            sumBy(cutoffBuckets, b => b.averageByFacet || 0) / cutoffBuckets.length,
            2
        ),
        percentilesByFacet: mergePercentiles(cutoffBuckets)
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
            if (axis1.mergeOtherBuckets === false && axis1.sort === 'options') {
                // when mergeOtherBuckets is false, and aggregations are sorted along
                // predefined options, do not apply cutoff
                // as that might result in unexpectedly missing buckets
                // (ex: missing "#2" bucket in "rank satisfaction from 1 to 5" question)
            } else {
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
