import { ResponseEditionData, RequestContext, ComputeAxisParameters } from '../../types'
import { getEntity } from '../../load/entities'

// add normalization tokens to facet and bucket items if applicable
export async function addTokens(
    resultsByEdition: ResponseEditionData[],
    context: RequestContext,
    axis1: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        for (let bucket of editionData.buckets) {
            const bucketToken = await getEntity({
                id: bucket.id,
                context,
                includeNormalizationEntities: true,
                tag: axis1?.question?.id
            })
            if (bucketToken) {
                bucket.token = bucketToken
            }
            if (bucket.facetBuckets) {
                for (let facetBucket of bucket.facetBuckets) {
                    const facetBucketsToken = await getEntity({
                        id: facetBucket.id,
                        includeNormalizationEntities: true,
                        tag: axis1?.question?.id
                    })
                    if (facetBucketsToken) {
                        facetBucket.token = facetBucketsToken
                    }
                }
            }
        }
    }
}
