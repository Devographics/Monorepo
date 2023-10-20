import { Bucket, ResponseEditionData } from '@devographics/types'
import sumBy from 'lodash/sumBy.js'
import { GenericComputeArguments } from '../../types'

// when a filter is applied, never publish any dataset with fewer than 10 *total* items;
// when a facet is applied, require every *individual facet* to have more than 10 items
const DEFAULT_DATASET_CUTOFF = 10

const zeroBucket = {
    count: 0,
    percentageQuestion: 0,
    percentageBucket: 0,
    percentageSurvey: 0
}

const getInsufficientDataBucket = (bucket: Bucket) => {
    return {
        ...bucket,
        hasInsufficientData: true,
        facetBuckets: bucket.facetBuckets.map(b => ({
            ...zeroBucket,
            id: b.id,
            hasInsufficientData: true
        }))
    }
}

export const applyDatasetCutoff = (
    resultsByEdition: ResponseEditionData[],
    computeArguments: GenericComputeArguments
) => {
    if (computeArguments.filters || computeArguments.facet) {
        const cutoff = process.env.DATASET_CUTOFF
            ? Number(process.env.DATASET_CUTOFF)
            : DEFAULT_DATASET_CUTOFF
        for (let editionData of resultsByEdition) {
            if (computeArguments.facet) {
                // "censor" out data for any bucket that comes under cutoff
                editionData.buckets = editionData.buckets.map(bucket =>
                    bucket.count && bucket.count < cutoff
                        ? getInsufficientDataBucket(bucket)
                        : bucket
                )
            } else {
                // calculate the sum of all buckets in current dataset
                const datasetSize = sumBy(editionData.buckets, 'count')
                if (datasetSize < cutoff) {
                    // if sum is lower than cutoff limit, remove this edition's results
                    resultsByEdition = resultsByEdition.filter(
                        e => e.editionId !== editionData.editionId
                    )
                }
            }
        }
    }
    return resultsByEdition
}
