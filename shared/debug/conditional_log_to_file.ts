/*

We need this conditional import to make sure we don't try to log out things in the edge
runtime, which doesn't support `fs`

*/

import type { LogOptions } from './log_to_file'

export const logToFile = async (fileName: string, object: any, options: LogOptions = {}) => {
    if (!process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === 'nodejs') {
        const helpers = await import('./log_to_file')
        return helpers.logToFile(fileName, object, options)
    } else {
        return
    }
}
