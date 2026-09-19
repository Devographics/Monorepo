import { BucketUnits, FacetBucket, OptionGroup } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import { NO_ANSWER, NOT_APPLICABLE, OVERALL } from '@devographics/constants'
import isNil from 'lodash/isNil.js'
import isNaN from 'lodash/isNaN.js'
import round from 'lodash/round.js'

/*

Find the option corresponding to a bucket.

Compare ids as strings: option ids and bucket ids don't always have the same type.
For numeric questions (e.g. `slider`), option ids come from YAML as numbers (`id: 0`)
and raw buckets from Mongo also have number ids, but `combineFacetBuckets` (used by
`mergeBuckets`) rebuilds facet buckets with `String(id)`. A strict `===` would then
fail on merged buckets (`0 !== "0"`), and callers would silently lose the option's
`value`/`average` and fall back to using the bucket id itself as its value
(i.e. slider percentiles going from 0 to 8 instead of 0 to 100).

*/
export const findBucketOption = <T extends { id: string | number }>(
    options: T[] | undefined,
    bucket: { id: string | number }
) => options?.find(o => String(o.id) === String(bucket.id))

/*

Note: we shouldn't have to use this, instead we drill down and get the average
of the items *within* the group

*/
const getGroupAverage = (group: OptionGroup) => {
    const { id, average, lowerBound, upperBound } = group
    if (average) {
        return average
    } else if (lowerBound && upperBound) {
        return lowerBound + (upperBound - lowerBound) / 2
    } else {
        throw new Error(`getGroupAverage: could not get average value for group ${id}`)
    }
}

// Given a bucket, find the average corresponding to its range
export const getBucketAverage = (
    bucket: FacetBucket | Bucket,
    axis: ComputeAxisParameters
): number => {
    if (bucket.id === 'range_work_for_free') {
        // note: yearly_salary's "range_work_for_free" is not in options anymore, so hardcode it
        // here for backwards compatibility's sake
        return 0
    }
    const groupedBuckets = bucket.groupedBuckets
    if (groupedBuckets) {
        // if bucket is a group of other buckets we need to get the average of all the
        // grouped buckets
        const average =
            groupedBuckets.length === 0
                ? 0
                : sumBy(groupedBuckets, bucket => getBucketAverage(bucket, axis)) /
                  groupedBuckets.length
        return average
    } else {
        const bucketOption = findBucketOption(axis?.options, bucket)
        let average
        if (bucketOption?.average !== undefined) {
            // bucket is a range, use its specified average value
            return bucketOption?.average
        } else if (bucketOption?.value !== undefined) {
            // bucket has a specified numerical value that is different from its id
            return bucketOption?.value
        } else if (axis?.question?.optionsAreNumeric) {
            // bucket has numeric options; use number version of id
            // note: this is only a fallback for options *without* a value; if a question's
            // options do define `value` (e.g. slider) and we end up here, the option lookup
            // above failed (see findBucketOption) and the result will be on the wrong scale
            return Number(bucket.id)
        }
        if (typeof average === 'undefined') {
            console.log({ bucket })
            console.log({ axis })
            throw new Error(
                `getBucketAverage: could not find option average for bucket "${bucket.id}" with axis "${axis.question.id}"`
            )
        }
        return average
    }
}

export const calculateAverage = ({
    buckets,
    axis
}: {
    buckets: Bucket[] | FacetBucket[]
    axis: ComputeAxisParameters
}) => {
    /*

    We exclude NO_ANSWER and na ("not applicable") facet buckets because otherwise they would
    warp the resulting average towards 0.

    */
    const filteredBuckets = buckets.filter(f => f.id !== NO_ANSWER && f.id !== NOT_APPLICABLE)
    const total = sumBy(filteredBuckets, bucket => bucket.count || 0)

    const averageValue =
        sumBy(filteredBuckets, bucket => {
            const average = getBucketAverage(bucket, axis)
            if (bucket.count && average) {
                return bucket.count * average
            } else {
                return 0
            }
        }) / total
    return round(averageValue, 1)
}

export async function addAverages(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    const calculateAxis1Average =
        axis1 && (axis1.question.optionsAreRange || axis1.question.optionsAreNumeric)
    const calculateAxis2Average =
        axis2 && (axis2.question.optionsAreRange || axis2.question.optionsAreNumeric)

    for (let editionData of resultsByEdition) {
        // calculate average of all top-level buckets
        if (calculateAxis1Average) {
            const buckets = editionData.buckets.filter(b => b.id !== OVERALL)
            editionData.average = calculateAverage({
                buckets,
                axis: axis1
            })
        }
        // calculate averages of all facet buckets for each top-level bucket
        for (let bucket of editionData.buckets) {
            if (bucket.id !== NOT_APPLICABLE) {
                if (bucket.hasInsufficientData) {
                    bucket[BucketUnits.AVERAGE] = 0
                } else {
                    const option = findBucketOption(axis1?.options, bucket)
                    if (bucket.facetBuckets && calculateAxis2Average) {
                        const average = calculateAverage({
                            buckets: bucket.facetBuckets,
                            axis: axis2
                        })
                        if (!isNil(average) && !isNaN(average)) {
                            bucket[BucketUnits.AVERAGE] = average
                        }
                    } else if (option?.average) {
                        // bucket is a range with a hardcoded average value
                        // note: this is not actually an "averageByFacet" but we can reuse
                        // the same property for now
                        // TODO: add a note explaining in which scenario we use this
                        bucket[BucketUnits.AVERAGE] = option.average
                    }
                }
            }
        }
    }
}
