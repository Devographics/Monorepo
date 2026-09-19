import { ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import sum from 'lodash/sum.js'
import sumBy from 'lodash/sumBy.js'
import round from 'lodash/round.js'
import { BucketData, BucketUnits } from '@devographics/types'
import { NO_ANSWER } from '@devographics/constants'
import uniq from 'lodash/uniq.js'
import compact from 'lodash/compact.js'
import { sortBuckets } from './sort_data'
import { calculatePercentiles2, zeroPercentiles } from './add_percentiles'
import { calculateAverage } from './add_averages'

export function mergeBuckets<T extends Bucket | FacetBucket>({
    buckets,
    mergedProps,
    isFacetBuckets,
    primaryAxis,
    secondaryAxis
}: {
    buckets: T[]
    mergedProps: any
    isFacetBuckets?: boolean
    primaryAxis: ComputeAxisParameters
    secondaryAxis?: ComputeAxisParameters
}) {
    const getValue = (bucket: Bucket | FacetBucket, unit: keyof BucketData) => bucket[unit] || 0
    const getSum = (unit: keyof BucketData) => round(sum(buckets.map(b => getValue(b, unit))), 2)

    const groupedBuckets = sortBuckets(buckets, primaryAxis)

    const mergedBucket = {
        groupedBuckets,
        groupedBucketIds: groupedBuckets.map(b => b.id),
        [BucketUnits.COUNT]: getSum(BucketUnits.COUNT),
        [BucketUnits.PERCENTAGE_QUESTION]: getSum(BucketUnits.PERCENTAGE_QUESTION),
        [BucketUnits.PERCENTAGE_SURVEY]: getSum(BucketUnits.PERCENTAGE_SURVEY),
        ...(isFacetBuckets
            ? { [BucketUnits.PERCENTAGE_BUCKET]: getSum(BucketUnits.PERCENTAGE_BUCKET) }
            : {}),
        ...mergedProps
    } as T

    if (buckets.every(b => !!b.hasInsufficientData)) {
        // if every bucket we merge has insufficient data, consider
        // then the merged bucket also has insufficient data
        mergedBucket.hasInsufficientData = true
    }

    if (secondaryAxis && !isFacetBuckets) {
        // if these are top-level buckets we also combine all *their* facet buckets
        // with one another to generate a new merged facetBuckets array
        const mergedBucket_ = mergedBucket as Bucket
        mergedBucket_.facetBuckets =
            combineFacetBuckets({
                buckets: buckets as Bucket[],
                axis: secondaryAxis,
                mergedBucket: mergedBucket_
            }) ?? []

        /*

        Average and percentiles are recomputed from the combined facet buckets
        rather than derived from the sub-buckets' own values. A percentile of a
        union is not a function of the percentiles of its parts (no weighting
        fixes that), and the sub-bucket averages left out `na`/`no_answer`
        respondents while their counts did not, so weighting them by count
        skewed the result.

        Only done when the sub-buckets carried these values, i.e. when the facet
        axis is a range or numeric question (see addAverages/addPercentiles).

        */
        const hasFacetStats = buckets.some(
            b => b[BucketUnits.AVERAGE] !== undefined || b[BucketUnits.PERCENTILES] !== undefined
        )
        if (hasFacetStats && mergedBucket_.facetBuckets.length > 0) {
            if (mergedBucket.hasInsufficientData) {
                mergedBucket[BucketUnits.AVERAGE] = 0
                mergedBucket[BucketUnits.PERCENTILES] = zeroPercentiles
                mergedBucket[BucketUnits.MEDIAN] = 0
            } else {
                const average = calculateAverage({
                    buckets: mergedBucket_.facetBuckets,
                    axis: secondaryAxis
                })
                // average is NaN when there's nothing to average (e.g. the facet
                // buckets are all `no_answer`/`na`), same as for percentiles use 0
                mergedBucket[BucketUnits.AVERAGE] = Number.isNaN(average) ? 0 : average
                const percentiles = calculatePercentiles2({
                    buckets: mergedBucket_.facetBuckets,
                    axis: secondaryAxis
                })
                mergedBucket[BucketUnits.PERCENTILES] = percentiles
                mergedBucket[BucketUnits.MEDIAN] = percentiles.p50
            }
        }
    } else {
        // no facet buckets to recompute from: buckets with a hardcoded option
        // average (a range question queried without a facet) can still be
        // combined, weighted by count
        const mergedAverage = mergeAverages(buckets)
        if (mergedAverage) {
            mergedBucket[BucketUnits.AVERAGE] = mergedAverage
        }
    }

    return mergedBucket
}

function mergeAverages(buckets: Bucket[] | FacetBucket[]) {
    const bucketsWithAverages = buckets.filter(b => b[BucketUnits.AVERAGE])
    if (bucketsWithAverages.length === 0) {
        return null
    } else {
        return round(
            sumBy(buckets, b => (b[BucketUnits.COUNT] || 0) * (b[BucketUnits.AVERAGE] || 0)) /
                sumBy(buckets, b => b[BucketUnits.COUNT] || 0),
            2
        )
    }
}

/*

Take a range of *top-level* buckets and combine their
facet buckets among each other

*/

export const combineFacetBuckets = ({
    buckets,
    axis,
    mergedBucket
}: {
    buckets: Bucket[]
    axis: ComputeAxisParameters
    mergedBucket: Bucket
}): FacetBucket[] => {
    const optionsOrGroups =
        axis?.enableBucketGroups && axis?.question.groups ? axis.question.groups : axis?.options
    if (!optionsOrGroups) {
        return []
    }
    const noAnswerOption = { id: NO_ANSWER, label: NO_ANSWER }

    let combinedFacetBuckets = compact(
        [...optionsOrGroups, noAnswerOption].map(option => {
            const { id, label } = option
            // for each facet, find the equivalent facetBuckets in all the main buckets
            // make sure to compact to remove undefined facetBuckets (when the equivalent
            // facetBucket doesn't exist in another main bucket)
            const sameFacetBuckets = compact(
                buckets.map(b => b?.facetBuckets?.find(fb => fb.id === option.id)!)
            )
            // if the current/option we're considering doen't have any matching facet buckets
            // across all buckets, return undefined to get rid of it
            if (sameFacetBuckets.length === 0) {
                return
            }
            const countSum = sum(sameFacetBuckets.map(b => b?.[BucketUnits.COUNT] ?? 0))
            let combinedFacetBucket: FacetBucket = {
                // Note: might create issues when option ID is not the same as facet bucket ID
                id: String(id),
                label,
                [BucketUnits.COUNT]: countSum,
                [BucketUnits.PERCENTAGE_BUCKET]: mergedBucket[BucketUnits.COUNT]
                    ? round((countSum * 100) / mergedBucket[BucketUnits.COUNT]!, 2)
                    : 0
            }
            // let combinedFacetBucket = mergeBuckets(sameFacetBuckets, { id, label }, true)
            // if the facets we're grouping all have groups, also combine the groups
            if (sameFacetBuckets.every(b => b.groupedBuckets)) {
                const groupedBuckets = uniq(sameFacetBuckets.map(b => b.groupedBuckets!).flat())
                const groupedBucketIds = groupedBuckets.map(b => b.id)
                combinedFacetBucket = {
                    ...combinedFacetBucket,
                    groupedBuckets,
                    groupedBucketIds
                }
            }

            return combinedFacetBucket
        })
    )
    return combinedFacetBuckets
}
