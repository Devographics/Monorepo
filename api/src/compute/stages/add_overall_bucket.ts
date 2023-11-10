import { ResponseEditionData, ResponsesTypes } from '@devographics/types'
import { GenericComputeOptions, convertOrderReverse, genericComputeFunction } from '../generic'
import { ComputeAxisParameters } from '../../types'
import { NO_ANSWER, OVERALL } from '@devographics/constants'

/*

Create "overall" bucket using overall data as facets

Note: filter out no answer bucket to avoid going over 100%
when adding all facets' percentageBucket

*/
export const getOverallBucket = (overallEditionData: ResponseEditionData) => {
    const overallBucket = {
        id: OVERALL,
        count: overallEditionData.completion.count,
        facetBuckets: overallEditionData.buckets.filter(bucket => bucket.id !== NO_ANSWER)
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
            responsesType: ResponsesTypes.RESPONSES,
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

    if (overallResults.length === 0) {
        console.log({ axis })
        console.log({ options })
        throw new Error(`addOverallBucket: no overall results found`)
    }
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
