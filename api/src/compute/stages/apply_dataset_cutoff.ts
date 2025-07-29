import { Bucket, BucketUnits, FacetBucket, ResponseEditionData } from '@devographics/types'
import { ComputeAxisParameters, GenericComputeArguments } from '../../types'
import sortBy from 'lodash/sortBy.js'
import sum from 'lodash/sum.js'
import { INSUFFICIENT_DATA, SENTIMENT_FACET } from '@devographics/constants'
import { zeroPercentiles } from './add_percentiles'
import { specialBucketIds } from './limit_data'

/* 

When a filter is applied, never publish any dataset with fewer than 10 *total* items;
When a facet is applied, require every *individual facet* to have more than 10 items

*/
const DEFAULT_DATASET_CUTOFF = 10

/*

There are some datapoints that we don't need to censor out because
they are not sensitive or private personal information

*/
const allowList = [SENTIMENT_FACET]

/*

Note: we need to set values to 0 instead of null or undefined to avoid 
messing up the charts because of missing datapoints.

*/

const getZeroBucket = <T extends Bucket | FacetBucket>(bucket: T) => ({
    ...bucket,
    [BucketUnits.COUNT]: 0,
    [BucketUnits.PERCENTAGE_QUESTION]: 0,
    [BucketUnits.PERCENTAGE_SURVEY]: 0,
    [BucketUnits.PERCENTILES]: zeroPercentiles,
    [BucketUnits.AVERAGE]: 0,
    [BucketUnits.MEDIAN]: 0,
    hasInsufficientData: true
})

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
    hasFacet,
    axis1,
    axis2
}: {
    bucket: Bucket
    hasFilter: boolean
    hasFacet: boolean
    axis1: ComputeAxisParameters
    axis2?: ComputeAxisParameters
}) => {
    const cutoff = getDatasetCutoff()

    /*

    First, mark any bucket that comes in under the cutoff with hasInsufficientData: true flag

    */
    let facetBucketsWithCutoff = hasFacet
        ? bucket.facetBuckets.map(facetBucket => {
              return facetBucket.count !== undefined && facetBucket.count < cutoff
                  ? { ...facetBucket, hasInsufficientData: true }
                  : facetBucket
          })
        : []

    /*

    If we have a single facet under the cutoff, then that facet's data
    can easily be deduced by subtracting all the other facets from the total, if 
    there are other facets. 

    To avoid this, also zero our the next smallest facet in those cases

    Note: make an exception for special buckets such as NO_ANSWER, those do not provide 
    any sensitive data by definition. 
    
    */
    const singleFacetUnderCutoff =
        facetBucketsWithCutoff
            .filter(fb => !specialBucketIds.includes(fb.id))
            .filter(fb => fb.hasInsufficientData).length === 1
    if (singleFacetUnderCutoff && facetBucketsWithCutoff.length > 1) {
        const sortedFacetBuckets = sortBy(facetBucketsWithCutoff, fb => fb.count)
        const secondSmallestFacetBucket = sortedFacetBuckets[1]
        const secondSmallestFacetBucketIndex = facetBucketsWithCutoff.findIndex(
            fb => fb.id === secondSmallestFacetBucket.id
        )
        facetBucketsWithCutoff[secondSmallestFacetBucketIndex] = {
            ...secondSmallestFacetBucket,
            hasInsufficientData: true
        }
    }

    /*

    After all facets under cutoff have been identified, merge them into 
    a single "INSUFFICIENT_DATA" facet bucket

    */
    const facetBucketsOverCutoff = facetBucketsWithCutoff.filter(fb => !fb.hasInsufficientData)
    const facetBucketsUnderCutoff = facetBucketsWithCutoff.filter(fb => fb.hasInsufficientData)

    const insufficientDataCount = sum(facetBucketsUnderCutoff.map(fb => fb[BucketUnits.COUNT]))
    const insufficientDataBucketPercentage = Math.round(
        sum(facetBucketsUnderCutoff.map(fb => fb[BucketUnits.PERCENTAGE_BUCKET]))
    )

    const insufficientDataBucket = {
        id: INSUFFICIENT_DATA,
        [BucketUnits.COUNT]: insufficientDataCount,
        [BucketUnits.PERCENTAGE_BUCKET]: insufficientDataBucketPercentage
    }

    facetBucketsWithCutoff = [...facetBucketsOverCutoff, insufficientDataBucket]

    /* 
    
    In some cases, the main bucket has a total count over the cutoff,
    but every individual facet bucket comes in *under* the cutoff.
    We also mark these buckets as having insufficient data

    */
    // TODO: should these buckets just be removed from the dataset altogether?
    const allFacetsUnderCutoff = facetBucketsWithCutoff.every(fb => fb.hasInsufficientData)
    const mainBucketIsInsufficient =
        (bucket.count !== undefined && bucket.count < cutoff) || (hasFacet && allFacetsUnderCutoff)
    // We only need to clear the main bucket's count when a filter is applied to segment the data
    const clearCount = hasFilter
    const bucketWithCutoff = mainBucketIsInsufficient ? getZeroBucket(bucket) : bucket

    return { ...bucketWithCutoff, facetBuckets: facetBucketsWithCutoff }
}

export const applyDatasetCutoff = async (
    resultsByEdition: ResponseEditionData[],
    computeArguments: GenericComputeArguments,
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters
) => {
    const hasFilter = !!computeArguments.filters
    const hasFacet = !!computeArguments.facet
    if (
        !computeArguments.filters &&
        computeArguments.facet &&
        allowList.includes(computeArguments.facet)
    ) {
        return
    }
    if (hasFilter || hasFacet) {
        for (let editionData of resultsByEdition) {
            // "censor" out data for any bucket that comes under cutoff
            editionData.buckets = editionData.buckets.map(bucket =>
                applyBucketCutoff({ bucket, hasFilter, hasFacet, axis1, axis2 })
            )
        }
    }
}
