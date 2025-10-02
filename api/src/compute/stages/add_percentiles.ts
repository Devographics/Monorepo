import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import minBy from 'lodash/minBy.js'
import maxBy from 'lodash/maxBy.js'
import isEmpty from 'lodash/isEmpty.js'
import compact from 'lodash/compact.js'
import cloneDeep from 'lodash/cloneDeep.js'
import { BucketUnits, FacetBucketWithAverage, PercentileData } from '@devographics/types'
import { getBucketAverage } from './add_averages'
import { CUTOFF_ANSWERS, NO_ANSWER, NOT_APPLICABLE, OVERALL } from '@devographics/constants'

export const percentileSteps = [0, 10, 25, 50, 75, 90, 100]

// Decorate facet bucket with average
const decorateWithAverages = (
    facetBuckets: FacetBucket[],
    axis: ComputeAxisParameters
): FacetBucketWithAverage[] =>
    facetBuckets.map(fb => ({ ...fb, average: getBucketAverage(fb, axis) }))

// v1: using aggregator
function calculatePercentiles1({
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

/*

This function calculates the index of the desired percentile 
using the formula (percentile / 100) * (arr.length - 1). 
If the index is an integer, the function returns the value at that index. 
If the index is not an integer, the function calculates the value at the 
desired percentile using linear interpolation between the two nearest integer indices.

*/
function calculatePercentile(datapoints: number[], percentile: number): number {
    // Note: there are situations where there are no datapoints at all
    // For example if every facet was zero'd out because its count was
    // lower than the privacy data cutoff
    if (datapoints.length === 0) {
        return 0
    }
    const index = (percentile / 100) * (datapoints.length - 1)

    if (index % 1 === 0) {
        return datapoints[index]
    } else {
        const lower = Math.floor(index)
        const upper = Math.ceil(index)
        return datapoints[lower] + (datapoints[upper] - datapoints[lower]) * (index - lower)
    }
}

// v2: expanding buckets into individual datapoints
function calculatePercentiles2({
    buckets,
    axis
}: {
    buckets: Bucket[] | FacetBucket[]
    axis: ComputeAxisParameters
}): PercentileData {
    const allFacetBuckets = compact(
        buckets
            .map(fb => {
                if (fb.groupedBuckets) {
                    // if bucket is made of grouped buckets, use those
                    return fb.groupedBuckets
                } else {
                    return [fb]
                }
            })
            .flat()
    )

    const filteredBuckets = allFacetBuckets.filter(
        fb => fb?.id !== NO_ANSWER && fb?.id !== NOT_APPLICABLE && fb?.id !== CUTOFF_ANSWERS
    )
    // decorate facet buckets with average corresponding to range
    const bucketsWithAverage = decorateWithAverages(cloneDeep(filteredBuckets), axis)

    // Sort buckets
    const sortedBuckets = [...bucketsWithAverage].sort((fb1, fb2) => fb1.average - fb2.average)

    // expand buckets into individual datapoints
    const allDatapoints = sortedBuckets
        .map(bucket => (bucket.count === 0 ? [] : Array(bucket.count).fill(bucket.average)))
        .flat()

    const percentiles = {
        p0: calculatePercentile(allDatapoints, 0),
        p10: calculatePercentile(allDatapoints, 10),
        p25: calculatePercentile(allDatapoints, 25),
        p50: calculatePercentile(allDatapoints, 50),
        p75: calculatePercentile(allDatapoints, 75),
        p90: calculatePercentile(allDatapoints, 90),
        p100: calculatePercentile(allDatapoints, 100)
    }

    return percentiles
}
export const zeroPercentiles = {
    p0: 0,
    p10: 0,
    p25: 0,
    p50: 0,
    p75: 0,
    p90: 0,
    p100: 0
}

export async function addPercentiles(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    const calculateAxis1Percentiles =
        axis1 && (axis1.question.optionsAreRange || axis1.question.optionsAreNumeric)
    const calculateAxis2Percentiles =
        axis2 && (axis2.question.optionsAreRange || axis2.question.optionsAreNumeric)

    if (calculateAxis1Percentiles || calculateAxis2Percentiles) {
        for (let editionData of resultsByEdition) {
            // calculate percentiles of all top-level buckets
            if (calculateAxis1Percentiles) {
                const percentiles = calculatePercentiles2({
                    buckets: editionData.buckets.filter(b => b.id !== OVERALL),
                    axis: axis1
                })
                editionData.percentiles = percentiles
                editionData.median = percentiles.p50
            }
            // calculate percentiles of all facet buckets for each top-level bucket
            if (calculateAxis2Percentiles) {
                for (let bucket of editionData.buckets) {
                    const percentiles = bucket.hasInsufficientData
                        ? zeroPercentiles
                        : calculatePercentiles2({
                              buckets: bucket.facetBuckets,
                              axis: axis2
                          })

                    bucket[BucketUnits.PERCENTILES] = percentiles
                    bucket[BucketUnits.MEDIAN] = percentiles.p50
                }
            }
        }
    }
}
