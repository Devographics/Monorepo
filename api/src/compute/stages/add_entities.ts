import { ResponseEditionData, RequestContext, ComputeAxisParameters } from '../../types'
import { getEntity } from '../../load/entities'

// add entities to facet and bucket items if applicable
export async function addEntities(
    resultsByEdition: ResponseEditionData[],
    context: RequestContext,
    axis1: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const bucketEntity = await getEntity({
                id: bucket.id,
                context,
                tag: axis1?.question?.id
            })
            if (bucketEntity) {
                bucket.entity = bucketEntity
            }
            if (bucket.facetBuckets) {
                for (let facetBucket of bucket.facetBuckets) {
                    const facetBucketsEntity = await getEntity({
                        id: facetBucket.id,
                        tag: axis1?.question?.id
                    })
                    if (facetBucketsEntity) {
                        facetBucket.entity = facetBucketsEntity
                    }
                }
            }
        }
    }
}
