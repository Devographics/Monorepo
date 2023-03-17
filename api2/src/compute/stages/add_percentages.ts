import { EditionData, Bucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'

const computeBucketsWithPercentages = (
    buckets: Bucket[],
    editionData: EditionData,
    parentBucket?: Bucket
) => {
    const bucketsWithPercentages = buckets.map(bucket => {
        const bucketWithPercentages = { ...bucket }
        bucketWithPercentages.percentageSurvey = ratioToPercentage(
            bucket.count / editionData.completion.total
        )
        bucketWithPercentages.percentageQuestion = ratioToPercentage(
            bucket.count / editionData.completion.count
        )
        if (parentBucket) {
            bucketWithPercentages.percentageFacet = ratioToPercentage(
                bucketWithPercentages.count / parentBucket.count
            )
        }
        return bucketWithPercentages
    })
    return bucketsWithPercentages
}

export async function addPercentages(resultsByEdition: EditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = computeBucketsWithPercentages(editionData.buckets, editionData)
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = computeBucketsWithPercentages(
                    bucket.facetBuckets,
                    editionData,
                    bucket
                )
            }
        }
    }
}
