import { ResponseEditionData } from '@devographics/types'
import cloneDeepWith from 'lodash/cloneDeepWith.js'
import { logToFile } from '@devographics/debug'

export async function detectNaN(
    resultsByEdition: ResponseEditionData[],
    isDebug: boolean = false,
    logPath: string
) {
    cloneDeepWith(resultsByEdition, async (value, key, object, stack) => {
        if (Number.isNaN(value)) {
            console.log({ key, object })
            if (isDebug) {
                // console.log('// results final')
                // console.log(JSON.stringify(results, undefined, 2))
                await logToFile(`${logPath}/results_error.yml`, resultsByEdition)
            }
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
