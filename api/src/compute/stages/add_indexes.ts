import { ResponseEditionData, RequestContext, ComputeAxisParameters } from '../../types'

// add indexes
export async function addIndexes(
    resultsByEdition: ResponseEditionData[],
    context: RequestContext,
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        let i = 0
        for (let bucket of editionData.buckets) {
            bucket.index = i
            i++
            if (bucket.facetBuckets) {
                let j = 0

                for (let facetBucket of bucket.facetBuckets) {
                    facetBucket.index = j
                    j++
                }
            }
        }
    }
}
