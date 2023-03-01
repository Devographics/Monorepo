import { EditionData, Bucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'

const computeBucketsWithPercentages = (
    buckets: Bucket[],
    editionData: EditionData,
    parentBucket?: Bucket
) => {
    const bucketsWithPercentages = buckets.map(bucket => {
        const bucketWithPercentages = { ...bucket }
        bucketWithPercentages.percentage_survey = ratioToPercentage(
            bucket.count / editionData.completion.total
        )
        bucketWithPercentages.percentage_question = ratioToPercentage(
            bucket.count / editionData.completion.count
        )
        if (parentBucket) {
            bucketWithPercentages.percentage_facet = ratioToPercentage(
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
