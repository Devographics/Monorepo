import { ResponseEditionData } from '@devographics/types'
import sumBy from 'lodash/sumBy.js'
import { GenericComputeArguments } from '../../types'

// by default, never publish any dataset with fewer than 10 items
// when any filter or facet is applied
const DEFAULT_DATASET_CUTOFF = 10

export const applyDatasetCutoff = (
    resultsByEdition: ResponseEditionData[],
    computeArguments: GenericComputeArguments
) => {
    if (computeArguments.filters || computeArguments.facet) {
        const cutoff = process.env.DATASET_CUTOFF
            ? Number(process.env.DATASET_CUTOFF)
            : DEFAULT_DATASET_CUTOFF
        for (let editionData of resultsByEdition) {
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
    return resultsByEdition
}
