import { ResponseEditionData } from '@devographics/types'
import { GenericComputeOptions, convertOrderReverse, genericComputeFunction } from '../generic'
import { ComputeAxisParameters } from '../../types'

// create "overall" bucket using overall data as facets
export const getOverallBucket = (overallEditionData: ResponseEditionData) => {
    const overallBucket = {
        id: 'overall',
        count: overallEditionData.completion.count,
        facetBuckets: overallEditionData.buckets
    }
    return overallBucket
}

export const addOverallBucket = async (
    resultsByEdition: ResponseEditionData[],
    axis: ComputeAxisParameters,
    options: GenericComputeOptions
) => {
    // build genericComputeFunction options based on the facet axis
    const newOptions: GenericComputeOptions = {
        ...options,
        question: axis.question,
        computeArguments: {
            ...options.computeArguments,
            facet: undefined,
            parameters: {
                ...options.computeArguments.parameters,
                sort: { property: axis.sort, order: convertOrderReverse(axis.order) },
                cutoff: axis.cutoff,
                groupUnderCutoff: axis.groupUnderCutoff,
                mergeOtherBuckets: axis.mergeOtherBuckets,
                enableBucketGroups: axis.enableBucketGroups,
                limit: axis.limit
            }
        }
    }
    const overallResults = await genericComputeFunction(newOptions)
    for (let editionData of resultsByEdition) {
        // for each edition, find corresponding edition in overall results
        const editionOverallResults = overallResults.find(
            editionData => editionData.editionId === editionData.editionId
        )
        // use that to generate an overall bucket
        const overallBucket = getOverallBucket(editionOverallResults!)
        editionData.buckets = [...editionData.buckets, overallBucket]
    }
}
