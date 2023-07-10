import { ResponseEditionData, Bucket, FacetBucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'
// import { NO_ANSWER } from '@devographics/constants'
const NO_ANSWER = 'no_answer'

const computeBucketsWithPercentages = <T extends Bucket | FacetBucket>(
    buckets: T[],
    editionData: ResponseEditionData,
    parentBucket?: Bucket
) => {
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
            bucketWithPercentages.percentageFacet = ratioToPercentage(
                bucketWithPercentages.count / parentBucket.count
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
