import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import floor from 'lodash/floor.js'

const getCount = (bucket: Bucket) => bucket.count || 0

const getPositiveCount = (bucket: Bucket) =>
    bucket?.facetBuckets?.find(fb => fb.id === SimplifiedSentimentOptions.POSITIVE_SENTIMENT)
        ?.count || 0

const getNegativeCount = (bucket: Bucket) =>
    bucket?.facetBuckets?.find(fb => fb.id === SimplifiedSentimentOptions.NEGATIVE_SENTIMENT)
        ?.count || 0

const roundRatio = (r: number) => floor(r, 2)

const emptyBucket = { count: 0 } as Bucket

export async function addRatios(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        const { buckets } = editionData
        const neverHeardBucket =
            buckets.find(b => b.id === FeaturesOptions.NEVER_HEARD) || emptyBucket
        const heardBucket = buckets.find(b => b.id === FeaturesOptions.HEARD) || emptyBucket
        const usedBucket = buckets.find(b => b.id === FeaturesOptions.USED) || emptyBucket

        const total = getCount(neverHeardBucket) + getCount(heardBucket) + getCount(usedBucket)

        // (heard + used) / total
        const awareness = (getCount(heardBucket) + getCount(usedBucket)) / total

        // heard positive / heard
        const interest = getPositiveCount(heardBucket) / getCount(heardBucket)

        // used / total
        const usage = getCount(usedBucket) / total

        // used positive / used
        const retention = getPositiveCount(usedBucket) / getCount(usedBucket)

        const allPositive =
            getPositiveCount(neverHeardBucket) +
            getPositiveCount(heardBucket) +
            getPositiveCount(usedBucket)
        // all positive / total
        const positivity = allPositive / total

        const ratios = {
            awareness: roundRatio(awareness),
            interest: roundRatio(interest),
            usage: roundRatio(usage),
            retention: roundRatio(retention),
            positivity: roundRatio(positivity)
        }
        editionData.ratios = ratios
    }
}
