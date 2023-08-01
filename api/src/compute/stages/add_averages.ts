import { ResponseEditionData, ComputeAxisParameters, Bucket } from '../../types'
import sumBy from 'lodash/sumBy.js'

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

    We exclude 'no_answer' facet buckets because otherwise they would
    warp the resulting average towards 0.

    We will then use this facetTotal to divide the sum and calculate our average. 

    */
    const facetTotal = sumBy(
        facetBuckets.filter(f => f.id !== 'no_answer'),
        facetBucket => facetBucket.count || 0
    )
    const averageValue =
        sumBy(facetBuckets, facetBucket => {
            const facetOption = axis.options?.find(o => o.id === facetBucket.id)
            if (facetBucket.count && facetOption && facetOption.average) {
                return facetBucket.count * facetOption.average
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
    for (let editionData of resultsByEdition) {
        if (axis2) {
            for (let bucket of editionData.buckets) {
                bucket.averageByFacet = calculateAverage({ bucket, axis: axis2 })
            }
        }
    }
}
