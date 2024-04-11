import { BucketUnits } from '@devographics/types'
import { ResponseEditionData, Bucket, FacetBucket, ComputeAxisParameters } from '../../types'
import { ratioToPercentage } from '../common'
import { NO_ANSWER } from '@devographics/constants'
import sum from 'lodash/sum.js'

const computeBucketsWithPercentages = <T extends Bucket | FacetBucket>({
    buckets,
    editionData,
    parentBucket
}: {
    buckets: T[]
    editionData: ResponseEditionData
    parentBucket?: Bucket
}) => {
    const noAnswerBucket = buckets.find(b => b.id === NO_ANSWER)
    const noAnswerCount = noAnswerBucket?.count || 0

    const bucketsWithPercentages = buckets.map(bucket => {
        const bucketCount = bucket.count ?? 0
        const bucketWithPercentages = { ...bucket }
        bucketWithPercentages[BucketUnits.PERCENTAGE_SURVEY] = ratioToPercentage(
            bucketCount / editionData.completion.total
        )
        bucketWithPercentages[BucketUnits.PERCENTAGE_QUESTION] =
            bucket.id === NO_ANSWER
                ? 0
                : ratioToPercentage(bucketCount / editionData.completion.count)

        if (parentBucket) {
            // note: we can't use parentBucket?.count as total value
            // because some facetBuckets might've been removed during dataset cutoff step;
            // instead, calculate sum of buckets from scratch
            // const parentBucketCount = parentBucket?.count ?? 0
            const parentBucketCount = sum(parentBucket.facetBuckets.map(fb => fb.count))

            const percentageBucket =
                parentBucketCount === 0 ? 0 : ratioToPercentage(bucketCount / parentBucketCount)
            bucketWithPercentages[BucketUnits.PERCENTAGE_BUCKET] = percentageBucket
        }
        return bucketWithPercentages
    })
    return bucketsWithPercentages
}

export async function addPercentages(resultsByEdition: ResponseEditionData[]) {
    for (let editionData of resultsByEdition) {
        editionData.buckets = computeBucketsWithPercentages<Bucket>({
            buckets: editionData.buckets,
            editionData
        })
        for (let bucket of editionData.buckets) {
            if (bucket.facetBuckets) {
                bucket.facetBuckets = computeBucketsWithPercentages<FacetBucket>({
                    buckets: bucket.facetBuckets,
                    editionData,
                    parentBucket: bucket
                })
            }
        }
    }
}
