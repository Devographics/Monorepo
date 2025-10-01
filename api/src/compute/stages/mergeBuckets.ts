import { ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import sum from 'lodash/sum.js'
import sumBy from 'lodash/sumBy.js'
import round from 'lodash/round.js'
import { BucketData, BucketUnits } from '@devographics/types'
import { NO_ANSWER } from '@devographics/constants'
import uniq from 'lodash/uniq.js'
import compact from 'lodash/compact.js'
import { sortBuckets } from './sort_data'
import { PercentileData, Percentiles } from '@devographics/types'

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

    const mergedAverage = mergeAverages(buckets)
    if (mergedAverage) {
        mergedBucket[BucketUnits.AVERAGE] = mergedAverage
    }

    const mergedPercentiles = mergePercentiles(buckets)
    if (mergedPercentiles) {
        // make sure merged buckets actually have percentiles
        mergedBucket[BucketUnits.PERCENTILES] = mergedPercentiles
        mergedBucket[BucketUnits.MEDIAN] = mergedPercentiles.p50
    }

    // if these are top-level buckets we also combine all *their* facet buckets
    // with one another to generate a new merged facetBuckets array
    if (secondaryAxis && !isFacetBuckets) {
        const mergedBucket_ = mergedBucket as Bucket
        mergedBucket_.facetBuckets =
            combineFacetBuckets({
                buckets: buckets as Bucket[],
                axis: secondaryAxis,
                mergedBucket: mergedBucket_
            }) ?? []
    }

    if (buckets.every(b => !!b.hasInsufficientData)) {
        // if every bucket we merge has insufficient data, consider
        // then the merged bucket also has insufficient data
        mergedBucket.hasInsufficientData = true
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

function mergePercentiles(buckets: Bucket[] | FacetBucket[]) {
    const percentileKeys = ['p0', 'p10', 'p25', 'p50', 'p75', 'p90', 'p100'] as Percentiles[]
    const percentiles = {} as PercentileData
    for (const key of percentileKeys) {
        const values = compact(buckets.map(b => b?.[BucketUnits.PERCENTILES]?.[key]))
        if (values.length === 0) {
            // if one or more percentile doesn't exist in any of the buckets, abort
            return null
        }
        percentiles[key] = round(sum(values) / buckets.length, 2)
    }
    return percentiles
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
                [BucketUnits.PERCENTAGE_BUCKET]: round(
                    (countSum * 100) / mergedBucket[BucketUnits.COUNT]!,
                    2
                )
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
