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
    const averageValue =
        sumBy(facetBuckets, facetBucket => {
            const facetOption = axis.options?.find(o => o.id === facetBucket.id)
            if (facetOption) {
                return (facetBucket.count || 0) * (facetOption?.average || 0)
            } else {
                return 0
            }
        }) / count
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
