import { ComputeAxisParameters, ResponseEditionData } from '../../types'
import { convertOrderReverse } from '../generic'

/*

Add metadata about the current results (such as how they're sorted)

*/
export async function addMetadata(
    resultsByEdition: ResponseEditionData[],
    axis1: ComputeAxisParameters,
    axis2?: ComputeAxisParameters | null
) {
    for (const editionData of resultsByEdition) {
        editionData._metadata = {} as ResponseEditionData['_metadata']
        if (axis1.sort) {
            editionData._metadata.axis1Sort = {
                property: axis1.sort,
                order: convertOrderReverse(axis1.order)
            }
        }
        if (axis2?.sort) {
            editionData._metadata.axis2Sort = {
                property: axis2.sort,
                order: convertOrderReverse(axis2.order)
            }
        }
    }
}
