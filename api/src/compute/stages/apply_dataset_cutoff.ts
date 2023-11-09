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

const getZeroBucket = <T extends Bucket | FacetBucket>({
    bucket,
    clearCount = false
}: {
    bucket: T
    clearCount: boolean
}) => {
    const zeroBucket = clearCount
        ? { ...bucket, count: 0, hasInsufficientData: true }
        : { ...bucket, hasInsufficientData: true }
    return zeroBucket
}

export const getDatasetCutoff = () => {
    return process.env.DATASET_CUTOFF ? Number(process.env.DATASET_CUTOFF) : DEFAULT_DATASET_CUTOFF
}

/*

If a filter is enabled, we want to zero out the parent bucket to "censor" any data

If a facet is enabled, we want to zero out all facet buckets. 

Note: if a facet is enabled but a filter is *not* enabled 
we don't need to censor the parent bucket

*/
export const applyBucketCutoff = ({
    bucket,
    hasFilter,
    hasFacet
}: {
    bucket: Bucket
    hasFilter: boolean
    hasFacet: boolean
}) => {
    const cutoff = getDatasetCutoff()

    const facetBucketsWithCutoff = hasFacet
        ? bucket.facetBuckets.map(facetBucket => {
              return facetBucket.count !== undefined && facetBucket.count < cutoff
                  ? getZeroBucket({ bucket: facetBucket, clearCount: true })
                  : facetBucket
          })
        : []

    /* 
    
    In some cases, the main bucket has a total count over the cutoff,
    but every individual facet bucket comes in *under* the cutoff.
    We also mark these buckets as having insufficient data

    */
    const allFacetsUnderCutoff = facetBucketsWithCutoff.every(fb => fb.hasInsufficientData)
    const mainBucketIsInsufficient =
        (bucket.count !== undefined && bucket.count < cutoff) || (hasFacet && allFacetsUnderCutoff)
    // We only need to clear the main bucket's count when a filter is applied to segment the data
    const clearCount = hasFilter
    const bucketWithCutoff = mainBucketIsInsufficient
        ? getZeroBucket({ bucket, clearCount })
        : bucket

    return { ...bucketWithCutoff, facetBuckets: facetBucketsWithCutoff }
}

export const applyDatasetCutoff = (
    resultsByEdition: ResponseEditionData[],
    computeArguments: GenericComputeArguments
) => {
    const hasFilter = !!computeArguments.filters
    const hasFacet = !!computeArguments.facet
    if (hasFilter || hasFacet) {
        for (let editionData of resultsByEdition) {
            // "censor" out data for any bucket that comes under cutoff
            editionData.buckets = editionData.buckets.map(bucket =>
                applyBucketCutoff({ bucket, hasFilter, hasFacet })
            )
        }
    }
    return resultsByEdition
}
