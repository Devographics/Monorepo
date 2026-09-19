import { ResponseEditionData, RequestContext, ComputeAxisParameters } from '../../types'
import { findBucketOption } from './add_averages'

// add values to facet and bucket items if applicable
export async function addValues(
    resultsByEdition: ResponseEditionData[],
    context: RequestContext,
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const option = findBucketOption(axis1?.options, bucket)
            // note: value can either be actual value, or the average value (for a range)
            const optionValue = option?.value || option?.average
            const idValue = axis1.question.optionsAreNumeric ? Number(bucket.id) : undefined
            const bucketValue = optionValue ?? idValue
            if (bucketValue !== undefined && !Number.isNaN(bucketValue)) {
                bucket.value = bucketValue
            }
            if (bucket.facetBuckets) {
                for (let facetBucket of bucket.facetBuckets) {
                    // note: look up the *facet* bucket's option (this used to look up the
                    // parent bucket's id in axis2's options, giving the wrong value)
                    const facetBucketValue = findBucketOption(axis2?.options, facetBucket)?.value
                    if (facetBucketValue !== undefined) {
                        facetBucket.value = facetBucketValue
                    }
                }
            }
        }
    }
}
