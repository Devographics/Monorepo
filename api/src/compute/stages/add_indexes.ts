import { Bucket, FacetBucket } from '@devographics/types'
import { ResponseEditionData, RequestContext, ComputeAxisParameters } from '../../types'

const addIndexRecursively = (buckets: Array<Bucket | FacetBucket>) => {
    let i = 0
    for (let bucket of buckets) {
        bucket.index = i
        i++
        if ('facetBuckets' in bucket && bucket.facetBuckets) {
            addIndexRecursively(bucket.facetBuckets)
        }
        if ('groupedBuckets' in bucket && bucket.groupedBuckets) {
            addIndexRecursively(bucket.groupedBuckets)
        }
        if ('nestedBuckets' in bucket && bucket.nestedBuckets) {
            addIndexRecursively(bucket.nestedBuckets)
        }
    }
}

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
            addIndexRecursively(editionData.buckets)
        }
    }
}
