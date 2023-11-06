import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import minBy from 'lodash/minBy.js'
import maxBy from 'lodash/maxBy.js'
import isEmpty from 'lodash/isEmpty.js'
import compact from 'lodash/compact.js'
import cloneDeep from 'lodash/cloneDeep.js'
import { BucketUnits, FacetBucketWithAverage, PercentileData } from '@devographics/types'
import { getFacetBucketAverage } from './add_averages'
import { CUTOFF_ANSWERS, NO_ANSWER, NOT_APPLICABLE } from '@devographics/constants'

// Decorate facet bucket with average
const decorateWithAverages = (
    facetBuckets: FacetBucket[],
    axis: ComputeAxisParameters
): FacetBucketWithAverage[] =>
    facetBuckets.map(fb => ({ ...fb, average: getFacetBucketAverage(fb, axis) }))

function calculatePercentiles({
    bucket,
    axis
}: {
    bucket: Bucket
    axis: ComputeAxisParameters
}): PercentileData {
    const allFacetBuckets = compact(
        bucket.facetBuckets
            .map(fb => {
                if (fb.groupedBuckets) {
                    // if facet bucket is made of grouped facet buckets, use those
                    return fb.groupedBuckets
                } else {
                    return [fb]
                }
            })
            .flat()
    )

    const filteredFacetBuckets = allFacetBuckets.filter(
        fb => fb?.id !== NO_ANSWER && fb?.id !== NOT_APPLICABLE && fb?.id !== CUTOFF_ANSWERS
    )
    // decorate facet buckets with average corresponding to range
    const facetBucketsWithAverage = decorateWithAverages(cloneDeep(filteredFacetBuckets), axis)

    // Sort salaries
    const sortedFacetBuckets = [...facetBucketsWithAverage].sort(
        (fb1, fb2) => fb1.average - fb2.average
    )

    const nonEmptyFacetBuckets = sortedFacetBuckets.filter(fb => fb.count! > 0)

    // Calculate total count
    const totalCount = sumBy(sortedFacetBuckets, facetBucket => facetBucket?.count || 0)

    // find minimum and maximum
    const p0 = minBy(nonEmptyFacetBuckets, fb => fb.average)?.average!

    const p100 = maxBy(nonEmptyFacetBuckets, fb => fb.average)?.average!

    // Define percentile indices
    const index10 = Math.floor(totalCount * 0.1)
    const index25 = Math.floor(totalCount * 0.25)
    const index50 = Math.floor(totalCount * 0.5)
    const index75 = Math.floor(totalCount * 0.75)
    const index90 = Math.floor(totalCount * 0.9)

    let p10: number | null = null
    let p25: number | null = null
    let p50: number | null = null
    let p75: number | null = null
    let p90: number | null = null
    let accumulatedCount = 0

    // Find percentiles
    for (let i = 0; i < sortedFacetBuckets.length; i++) {
        accumulatedCount += sortedFacetBuckets[i].count!
        // console.log('// Find percentiles')
        // console.log(accumulatedCount)
        // console.log(sortedFacetBuckets[i])
        // console.log(p25)
        // console.log(p50)
        // console.log(p75)

        if (p10 === null && accumulatedCount >= index10) {
            p10 = sortedFacetBuckets[i].average
        }
        if (p25 === null && accumulatedCount >= index25) {
            p25 = sortedFacetBuckets[i].average
        }
        if (p50 === null && accumulatedCount >= index50) {
            p50 = sortedFacetBuckets[i].average
        }
        if (p75 === null && accumulatedCount >= index75) {
            p75 = sortedFacetBuckets[i].average
        }
        if (p90 === null && accumulatedCount >= index90) {
            p90 = sortedFacetBuckets[i].average
        }
        if (p10 !== null && p25 !== null && p50 !== null && p75 !== null && p90 !== null) {
            break
        }
    }

    const percentiles = {
        p0,
        p10: p10 as number,
        p25: p25 as number,
        p50: p50 as number,
        p75: p75 as number,
        p90: p90 as number,
        p100
    }
    return percentiles
}

const zeroPercentiles = {
    p0: 0,
    p10: 0,
    p25: 0,
    p50: 0,
    p75: 0,
    p90: 0,
    p100: 0
}

export async function addPercentilesByFacet(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    if (axis2.question.optionsAreRange) {
        for (let editionData of resultsByEdition) {
            if (axis2) {
                for (let bucket of editionData.buckets) {
                    bucket.percentilesByFacet = bucket.hasInsufficientData
                        ? zeroPercentiles
                        : calculatePercentiles({ bucket, axis: axis2 })
                }
            }
        }
    }
}
