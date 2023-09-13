import { ResponseEditionData, Bucket, FacetBucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'
// import { NO_ANSWER } from '@devographics/constants'
const NO_ANSWER = 'no_answer'

const computeBucketsWithPercentages = <T extends Bucket | FacetBucket>(
    buckets: T[],
    editionData: ResponseEditionData,
    parentBucket?: Bucket
) => {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)
    const noAnswerCount = noAnswerBucket?.count || 0

    const bucketsWithPercentages = buckets.map(bucket => {
        const bucketWithPercentages = { ...bucket }
        bucketWithPercentages.percentageSurvey = ratioToPercentage(
            bucket.count / editionData.completion.total
        )
        bucketWithPercentages.percentageQuestion =
            bucket.id === NO_ANSWER
                ? 0
                : ratioToPercentage(bucket.count / editionData.completion.count)
        if (parentBucket) {
            // unless this is the "no answer" bucket,
            // we take out the count of respondents who didn't answer
            // because we don't show them in the facet charts either
            const totalRespondentsInParentBucket =
                bucket.id === NO_ANSWER ? parentBucket.count : parentBucket.count - noAnswerCount
            bucketWithPercentages.percentageBucket = ratioToPercentage(
                bucketWithPercentages.count / totalRespondentsInParentBucket
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
