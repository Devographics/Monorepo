import { COUNT, CUTOFF_ANSWERS } from '@devographics/constants'
import { ResponseEditionData, ComputeAxisParameters, Bucket, FacetBucket } from '../../types'
import sum from 'lodash/sum.js'
import compact from 'lodash/compact.js'
import round from 'lodash/round.js'
import { BucketUnits, PercentileData, Percentiles } from '@devographics/types'
import { isSpecialBucket } from './limit_data'
import { mergeBuckets } from './mergeBuckets'

export async function restrictBuckets(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) {
    const { bucketsFilter } = axis1
    if (bucketsFilter) {
        for (let editionData of resultsByEdition) {
            editionData.buckets = editionData.buckets.filter(bucket => {
                if (bucketsFilter.eq) {
                    return bucketsFilter.eq === bucket.id
                }
                if (bucketsFilter.in) {
                    return bucketsFilter.in?.includes(bucket.id)
                }
                if (bucketsFilter.nin) {
                    return !bucketsFilter.nin?.includes(bucket.id)
                }
            })

            if (axis2) {
                for (let bucket of editionData.buckets) {
                    // for now we only filter based on axis1 to keep things simple
                }
            }
        }
    }
}
