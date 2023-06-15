import { ResponseEditionData, RequestContext } from '../../types'
import { getEntity } from '../../load/entities'

// add entities to facet and bucket items if applicable
export async function addEntities(
    resultsByEdition: ResponseEditionData[],
    context: RequestContext
) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const bucketEntity = await getEntity({ id: bucket.id, context })
            if (bucketEntity) {
                bucket.entity = bucketEntity
            }
            if (bucket.facetBuckets) {
                for (let facetBucket of bucket.facetBuckets) {
                    const facetBucketsEntity = await getEntity({ id: facetBucket.id })
                    if (facetBucketsEntity) {
                        facetBucket.entity = facetBucketsEntity
                    }
                }
            }
        }
    }
}
