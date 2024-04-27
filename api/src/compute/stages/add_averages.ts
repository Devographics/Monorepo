import { BucketUnits, FacetBucket, OptionGroup } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import { NO_ANSWER, NOT_APPLICABLE } from '@devographics/constants'
import isNil from 'lodash/isNil.js'
import isNaN from 'lodash/isNaN.js'
import round from 'lodash/round.js'

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

// Given a bucket, find the corresponding average corresponding to its range
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
        // bucket is not a group, we just get the average from the corresponding option;
        // or the bucket id itself if the question is numeric
        const average = axis?.question?.optionsAreNumeric
            ? Number(bucket.id)
            : axis?.options?.find(o => o.id === bucket.id)?.average
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

    if (calculateAxis1Average || calculateAxis2Average) {
        for (let editionData of resultsByEdition) {
            // calculate average of all top-level buckets
            if (calculateAxis1Average) {
                editionData.average = calculateAverage({
                    buckets: editionData.buckets,
                    axis: axis1
                })
            }
            // calculate averages of all facet buckets for each top-level bucket
            if (calculateAxis2Average) {
                for (let bucket of editionData.buckets) {
                    if (bucket.id !== NOT_APPLICABLE) {
                        if (bucket.hasInsufficientData) {
                            bucket[BucketUnits.AVERAGE] = 0
                        } else {
                            const average = calculateAverage({
                                buckets: bucket.facetBuckets,
                                axis: axis2
                            })
                            if (!isNil(average) && !isNaN(average)) {
                                bucket[BucketUnits.AVERAGE] = average
                            }
                        }
                    }
                }
            }
        }
    }
}
