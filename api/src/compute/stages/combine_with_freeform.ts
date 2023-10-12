import { NO_ANSWER } from '@devographics/constants'
import { ResponseEditionData, ResponsesTypes } from '@devographics/types'
import { GenericComputeOptions, genericComputeFunction } from '../generic'

/*

Take results from a question's predefined options and results from a question's
freeform field and combine them into a single results dataset

*/
export const combineEditionData = (
    responseEditionData: ResponseEditionData,
    freeformEditionData?: ResponseEditionData
) => {
    if (!freeformEditionData) {
        // if there is no freeform data just return regular response data
        return responseEditionData
    } else {
        // get rid of freeform data's "no answer" bucket
        const freeformBuckets = freeformEditionData.buckets
            .filter(b => b.id !== NO_ANSWER)
            .map(b => ({ ...b, isFreeformData: true }))
        const combinedBuckets = [...responseEditionData.buckets, ...freeformBuckets]
        const combinedEditionData = { ...responseEditionData, buckets: combinedBuckets }
        return combinedEditionData
    }
}

export const combineResults = (
    responseResults: ResponseEditionData[],
    freeformResults: ResponseEditionData[]
) => {
    const combinedResults: ResponseEditionData[] = []
    for (let editionResponseData of responseResults) {
        const editionFreeformData = freeformResults.find(
            editionData => editionData.editionId === editionResponseData.editionId
        )
        const combinedEditionData = combineEditionData(editionResponseData, editionFreeformData)
        combinedResults.push(combinedEditionData)
    }
    return combinedResults
}

export const combineWithFreeform = async (
    responseResults: ResponseEditionData[],
    options: GenericComputeOptions
) => {
    options.computeArguments.responsesType = ResponsesTypes.FREEFORM
    const freeformResults = await genericComputeFunction(options)
    if (freeformResults) {
        return combineResults(responseResults, freeformResults)
    } else {
        return responseResults
    }
}
