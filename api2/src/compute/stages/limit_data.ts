import { EditionData, ComputeAxisParameters, Bucket } from '../../types'
import take from 'lodash/take.js'

export async function limitData(
    resultsByEdition: EditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        // first, limit regular buckets
        if (axis1.sort !== 'options') {
            // do not apply limits for aggregations that are sorted along predefined options,
            // as that might result in unexpectedly missing buckets
            editionData.buckets = take(editionData.buckets, axis1.limit)
        }

        if (axis2 && axis2.sort !== 'options') {
            // then, limit facetBuckets if they exist
            for (let bucket of editionData.buckets) {
                bucket.facetBuckets = take(bucket.facetBuckets, axis2.limit)
            }
        }
    }
}
