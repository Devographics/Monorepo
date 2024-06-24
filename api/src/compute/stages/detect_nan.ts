import { ResponseEditionData } from '@devographics/types'
import cloneDeepWith from 'lodash/cloneDeepWith.js'

export async function detectNaN(resultsByEdition: ResponseEditionData[]) {
    cloneDeepWith(resultsByEdition, (value, key, object, stack) => {
        if (Number.isNaN(value)) {
            console.log({ key, object })
            // console.log(stack)
            throw new Error(
                `detectNaN: Detected NaN value in key ${key} of object: ${JSON.stringify(
                    object,
                    null,
                    2
                )}`
            )
        }
    })
}
