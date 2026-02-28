
import { type FetchPipelineStep } from './pipeline'
import { logToFile } from '@devographics/debug'

export function fileLoggerPipelineStep(filename: string): FetchPipelineStep<any> {
    return {
        name: "logToFile",
        set(data) { logToFile(filename, data) },
        disabled: false,
    }
}