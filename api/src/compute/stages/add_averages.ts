import { BucketUnits, FacetBucket, OptionGroup } from '@devographics/types'
import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'
import { NO_ANSWER, NOT_APPLICABLE } from '@devographics/constants'
import { getgid } from 'process'

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
export const getFacetBucketAverage = (facetBucket: FacetBucket, axis: ComputeAxisParameters) => {
    if (facetBucket.id === 'range_work_for_free') {
        // note: yearly_salary's "range_work_for_free" is not in options anymore, so hardcode it
        // here for backwards compatibility's sake
        return 0
    }
    const option = axis?.options?.find(o => o.id === facetBucket.id)
    const group = axis?.question?.groups?.find(o => o.id === facetBucket.id)
    const average = option?.average ?? (group && getGroupAverage(group))
    if (!average) {
        throw new Error(
            `getFacetBucketAverage: could not find option average for facet bucket "${facetBucket.id}" with axis "${axis.question.id}"`
        )
    }
    return average
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
    return Math.round(averageValue)
}

export async function addAveragesByFacet(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2: ComputeAxisParameters
) {
    if (axis2.question.optionsAreRange) {
        for (let editionData of resultsByEdition) {
            if (axis2) {
                for (let bucket of editionData.buckets) {
                    if (bucket.id !== NO_ANSWER && bucket.id !== NOT_APPLICABLE) {
                        bucket[BucketUnits.AVERAGE] = calculateAverage({ bucket, axis: axis2 })
                    }
                }
            }
        }
    }
}
