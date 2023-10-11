import { ResponseEditionData } from '@devographics/types'
import sumBy from 'lodash/sumBy.js'

// by default, never publish any dataset with fewer than 10 items
const DEFAULT_DATASET_CUTOFF = 10

export const applyDatasetCutoff = (resultsByEdition: ResponseEditionData[]) => {
    const cutoff = Number(process.env.DATASET_CUTOFF) ?? DEFAULT_DATASET_CUTOFF
    for (let editionData of resultsByEdition) {
        // calculate the sum of all buckets in current dataset
        const datasetSize = sumBy(editionData.buckets, 'count')
        if (datasetSize < cutoff) {
            // if sum is lower than cutoff limit, remove this edition's results
            resultsByEdition = resultsByEdition.filter(e => e.editionId !== editionData.editionId)
        }
    }
    return resultsByEdition
}
