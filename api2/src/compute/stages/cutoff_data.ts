import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import isEmpty from 'lodash/isEmpty.js'

export async function cutoffData(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        // first, limit regular buckets
        if (axis1.sort !== 'options') {
            // do not apply cutoffs for aggregations that are sorted along predefined options,
            // as that might result in unexpectedly missing buckets
            editionData.buckets = editionData.buckets.filter(
                bucket => isEmpty(bucket.count) || bucket.count >= axis1.cutoff
            )
        }

        if (axis2 && axis2.sort !== 'options') {
            // then, limit facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = bucket.facetBuckets.filter(
                    bucket => isEmpty(bucket.count) || bucket.count >= axis1.cutoff
                )
            }
        }
    }
}
