import { ResponseEditionData, Bucket, FacetBucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'
import { NO_ANSWER } from '@devographics/constants'

const computeBucketsWithPercentages = <T extends Bucket | FacetBucket>(
    buckets: T[],
    editionData: ResponseEditionData,
    parentBucket?: Bucket
) => {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)
    const noAnswerCount = noAnswerBucket?.count || 0

    const bucketsWithPercentages = buckets.map(bucket => {
        const bucketCount = bucket.count ?? 0
        const bucketWithPercentages = { ...bucket }
        bucketWithPercentages.percentageSurvey = ratioToPercentage(
            bucketCount / editionData.completion.total
        )
        bucketWithPercentages.percentageQuestion =
            bucket.id === NO_ANSWER
                ? 0
                : ratioToPercentage(bucketCount / editionData.completion.count)
        if (parentBucket) {
            const parentBucketCount = parentBucket?.count ?? 0
            bucketWithPercentages.percentageBucket = ratioToPercentage(
                bucketCount / parentBucketCount
            )
        }
        return bucketWithPercentages
    })
    return bucketsWithPercentages
}

export async function addPercentages(resultsByEdition: ResponseEditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = computeBucketsWithPercentages<Bucket>(
            editionData.buckets,
            editionData
        )
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = computeBucketsWithPercentages<FacetBucket>(
                    bucket.facetBuckets,
                    editionData,
                    bucket
                )
            }
        }
    }
}
