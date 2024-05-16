
import { type FetchPipelineStep } from './pipeline'
import { allowedCachingMethods } from './helpers'
import { logToFile } from '@devographics/debug'

export function fileLoggerPipelineStep(filename: string): FetchPipelineStep<any> {
    const allowedCaches = allowedCachingMethods()
    return {
        name: "logToFile",
        set(data) { logToFile(filename, data) },
        disabled: !allowedCaches.filesystem,
    }
}