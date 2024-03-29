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

// Given a facet bucket, find the corresponding average corresponding to its range
export const getFacetBucketAverage = (
    facetBucket: FacetBucket,
    axis: ComputeAxisParameters
): number => {
    if (facetBucket.id === 'range_work_for_free') {
        // note: yearly_salary's "range_work_for_free" is not in options anymore, so hardcode it
        // here for backwards compatibility's sake
        return 0
    }
    const groupedBuckets = facetBucket.groupedBuckets
    if (groupedBuckets) {
        // if facet is a group of other facet buckets we need to get the average of all the
        // grouped buckets
        const average =
            groupedBuckets.length === 0
                ? 0
                : sumBy(groupedBuckets, bucket => getFacetBucketAverage(bucket, axis)) /
                  groupedBuckets.length
        return average
    } else {
        // facet is not a group, we just get the average from the corresponding option;
        // or the bucket id itself if the question is numeric
        const average = axis?.question?.optionsAreNumeric
            ? Number(facetBucket.id)
            : axis?.options?.find(o => o.id === facetBucket.id)?.average
        if (typeof average === 'undefined') {
            console.log({ facetBucket })
            console.log({ axis })
            throw new Error(
                `getFacetBucketAverage: could not find option average for facet bucket "${facetBucket.id}" with axis "${axis.question.id}"`
            )
        }
        return average
    }
}

export const calculateAverage = ({
    bucket,
    axis
}: {
    bucket: Bucket
    axis: ComputeAxisParameters
}) => {
    const { count, facetBuckets } = bucket
    if (!count) {
        return 0
    }
    /*

    We exclude NO_ANSWER and na ("not applicable") facet buckets because otherwise they would
    warp the resulting average towards 0.

    */
    const filteredFacetBuckets = facetBuckets.filter(
        f => f.id !== NO_ANSWER && f.id !== NOT_APPLICABLE
    )
    const facetTotal = sumBy(filteredFacetBuckets, facetBucket => facetBucket.count || 0)

    const averageValue =
        sumBy(filteredFacetBuckets, facetBucket => {
            const average = getFacetBucketAverage(facetBucket, axis)
            if (facetBucket.count && average) {
                return facetBucket.count * average
            } else {
                return 0
            }
        }) / facetTotal
    return round(averageValue, 1)
}

export async function addAveragesByFacet(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    if (axis2.question.optionsAreRange || axis2.question.optionsAreNumeric) {
        for (let editionData of resultsByEdition) {
            if (axis2) {
                for (let bucket of editionData.buckets) {
                    if (bucket.id !== NOT_APPLICABLE) {
                        if (bucket.hasInsufficientData) {
                            bucket[BucketUnits.AVERAGE] = 0
                        } else {
                            const average = calculateAverage({ bucket, axis: axis2 })
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
