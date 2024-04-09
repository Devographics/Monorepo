import { ResponseEditionData, ComputeAxisParameters } from '../../types'
import { OTHER_ANSWERS } from '@devographics/constants'
import { mergeBuckets } from './mergeBuckets'
import { isNotSpecialBucket, isSpecialBucket } from './limit_data'

// ! Note: using this creates "groups of groups" (for example grouping cutoff data
// ! and off-limit data groups together)
export async function groupOtherBuckets(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    for (let editionData of resultsByEdition) {
        if (axis1.mergeOtherBuckets) {
            const regularBuckets = editionData.buckets.filter(isNotSpecialBucket)
            const specialBuckets = editionData.buckets.filter(isSpecialBucket)

            const combinedOtherBucket = mergeBuckets({
                buckets: specialBuckets,
                mergedProps: { id: OTHER_ANSWERS },
                axis: axis2
            })

            editionData.buckets = [...regularBuckets, combinedOtherBucket]
        }
    }
}
