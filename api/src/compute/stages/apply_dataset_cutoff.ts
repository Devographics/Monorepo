import { Bucket, BucketUnits, FacetBucket, ResponseEditionData } from '@devographics/types'
import sumBy from 'lodash/sumBy.js'
import { GenericComputeArguments } from '../../types'

// when a filter is applied, never publish any dataset with fewer than 10 *total* items;
// when a facet is applied, require every *individual facet* to have more than 10 items
const DEFAULT_DATASET_CUTOFF = 10

/*

Note: we need to set values to 0 instead of null or undefined to avoid 
messing up the charts because of missing datapoints.

*/

const getZeroBucket = <T extends Bucket | FacetBucket>(
    bucket: T,
    clearBasicInfo: boolean = false
) => {
    const zeroBucket = {
        count: 0,
        percentageQuestion: 0,
        percentageBucket: 0,
        percentageSurvey: 0,
        averageByFacet: 0,
        percentilesByFacet: {
            p0: 0,
            p25: 0,
            p50: 0,
            p75: 0,
            p100: 0
        }
    } as T
    const fieldsToKeep: Array<keyof T> = clearBasicInfo
        ? ['id', 'groupedBucketIds']
        : [
              'id',
              'groupedBucketIds',
              BucketUnits.COUNT,
              BucketUnits.PERCENTAGE_QUESTION,
              BucketUnits.PERCENTAGE_QUESTION
          ]
    const newBucket = {} as T
    for (const key_ of Object.keys(bucket)) {
        // build new bucket by either keeping value, or using "zero" value
        const key = key_ as keyof T
        newBucket[key] = fieldsToKeep.includes(key) ? bucket[key] : zeroBucket[key]
    }
    return { ...newBucket, hasInsufficientData: true }
}

/*

If a filter is enabled, we want to zero out the parent bucket to "censor" any data

If a facet is enabled, we want to zero out all facet buckets. 

Note: if a facet is enabled but a filter is *not* enabled 
we don't need to censor the parent bucket

*/
const getInsufficientDataBucket = ({
    bucket,
    hasFilter,
    hasFacet
}: {
    bucket: Bucket
    hasFilter: boolean
    hasFacet: boolean
}) => {
    const parentBucket = getZeroBucket(bucket, hasFilter)
    return {
        ...parentBucket,
        facetBuckets: (bucket.facetBuckets ?? []).map(b => getZeroBucket(b, true))
    }
}

export const getDatasetCutoff = () => {
    return process.env.DATASET_CUTOFF ? Number(process.env.DATASET_CUTOFF) : DEFAULT_DATASET_CUTOFF
}

export const applyDatasetCutoff = (
    resultsByEdition: ResponseEditionData[],
    computeArguments: GenericComputeArguments
) => {
    const hasFilter = !!computeArguments.filters
    const hasFacet = !!computeArguments.facet
    if (hasFilter || hasFacet) {
        const cutoff = getDatasetCutoff()
        for (let editionData of resultsByEdition) {
            // "censor" out data for any bucket that comes under cutoff
            editionData.buckets = editionData.buckets.map(bucket =>
                typeof bucket.count !== 'undefined' && bucket.count < cutoff
                    ? getInsufficientDataBucket({ bucket, hasFilter, hasFacet })
                    : bucket
            )
        }
    }
    return resultsByEdition
}
