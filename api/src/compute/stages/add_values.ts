import { ResponseEditionData, RequestContext, ComputeAxisParameters } from '../../types'

// add values to facet and bucket items if applicable
export async function addValues(
    resultsByEdition: ResponseEditionData[],
    context: RequestContext,
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const bucketValue = axis1?.options?.find(o => o.id === bucket.id)?.value
            if (bucketValue !== undefined) {
                bucket.value = bucketValue
            }
            if (bucket.facetBuckets) {
                for (let facetBucket of bucket.facetBuckets) {
                    const facetBucketValue = axis2?.options?.find(o => o.id === bucket.id)?.value
                    if (facetBucketValue !== undefined) {
                        facetBucket.value = facetBucketValue
                    }
                }
            }
        }
    }
}
