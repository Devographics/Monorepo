import { FeaturesOptions, SimplifiedSentimentOptions } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import floor from 'lodash/floor.js'

const getCount = (bucket: Bucket) => bucket.count || 0

// TODO: currently, if a bucket has insufficient data and has been removed
// the resulting count will go to 0.
// in the future, find a way to distinguish between this scenario and the
// scenario where there are *actually* 0 positive/negative respondents
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

        const neverHeardBucketCount = getCount(neverHeardBucket)
        const neverHeardBucketPositiveCount = getPositiveCount(neverHeardBucket)
        const neverHeardBucketNegativeCount = getNegativeCount(neverHeardBucket)

        const heardBucketCount = getCount(heardBucket)
        const heardBucketPositiveCount = getPositiveCount(heardBucket)
        const heardBucketNegativeCount = getNegativeCount(heardBucket)

        const usedBucketCount = getCount(usedBucket)
        const usedBucketPositiveCount = getPositiveCount(usedBucket)
        const usedBucketNegativeCount = getNegativeCount(usedBucket)

        const withSentimentTotal =
            neverHeardBucketPositiveCount +
            neverHeardBucketNegativeCount +
            heardBucketPositiveCount +
            heardBucketNegativeCount +
            usedBucketPositiveCount +
            usedBucketNegativeCount

        const total = neverHeardBucketCount + heardBucketCount + usedBucketCount

        // (heard + used) / total
        const awareness = (heardBucketCount + usedBucketCount) / total

        // heard positive / (heard positive + heard negative)
        const interest =
            heardBucketPositiveCount + heardBucketNegativeCount === 0
                ? 0
                : heardBucketPositiveCount / (heardBucketPositiveCount + heardBucketNegativeCount)

        // used / total
        const usage = usedBucketCount / total

        // used positive / (used positive + used negative)
        const retention =
            usedBucketPositiveCount + usedBucketNegativeCount === 0
                ? 0
                : usedBucketPositiveCount / (usedBucketPositiveCount + usedBucketNegativeCount)

        const allPositive =
            neverHeardBucketPositiveCount + heardBucketPositiveCount + usedBucketPositiveCount
        // all positive / total
        const positivity = allPositive / total

        const positivityRelative = allPositive / withSentimentTotal

        // Positivity shift between respondents who **haven't used**
        // an item and those who **have**, in percentage points gained

        const appreciation = interest === 0 || retention === 0 ? 0 : retention - interest

        const ratios = {
            awareness: roundRatio(awareness),
            interest: roundRatio(interest),
            usage: roundRatio(usage),
            retention: roundRatio(retention),
            positivity: roundRatio(positivity),
            positivityRelative: roundRatio(positivityRelative),
            appreciation: roundRatio(appreciation)
        }
        editionData.ratios = ratios
    }
}
