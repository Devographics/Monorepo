import { ResponseEditionData } from '@devographics/types'
import cloneDeepWith from 'lodash/cloneDeepWith.js'
import { logToFile } from '@devographics/debug'

type Traversable = Record<string, any> | any[]

interface TraverseArgs {
    value: any
    path: (string | number)[]
}

async function traverse(
    obj: Traversable,
    callback: (args: TraverseArgs) => Promise<void>,
    path: (string | number)[] = []
): Promise<void> {
    if (Array.isArray(obj)) {
        for (let index = 0; index < obj.length; index++) {
            const item = obj[index]
            const newPath = [...path, index]

            if (typeof item === 'object' && item !== null) {
                await traverse(item, callback, newPath) // await ensures interruption on error
            } else {
                await callback({ value: item, path: newPath })
            }
        }
    } else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            const newPath = [...path, key]

            if (typeof value === 'object' && value !== null) {
                await traverse(value, callback, newPath)
            } else {
                await callback({ value, path: newPath })
            }
        }
    } else {
        // root primitive
        await callback({ value: obj, path })
    }
}

export async function detectNaN(
    resultsByEdition: ResponseEditionData[],
    isDebug: boolean = false,
    logPath: string
) {
    traverse(resultsByEdition, async ({ value, path }) => {
        if (Number.isNaN(value)) {
            console.log({ path, value })
            if (isDebug) {
                // console.log('// results final')
                // console.log(JSON.stringify(results, undefined, 2))
                await logToFile(`${logPath}/results_error.yml`, resultsByEdition)
            }

            throw new Error(
                `detectNaN: Detected NaN value in path ${path} of object: ${JSON.stringify(
                    value,
                    null,
                    2
                )}`
            )
        }
    })
}
