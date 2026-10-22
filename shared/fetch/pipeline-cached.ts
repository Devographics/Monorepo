
import { pipeline } from "./pipeline"
import { fileLoggerPipelineStep } from "./pipeline-file-logger"
import { redisPipelineStep } from "./pipeline-redis"

/**
 * Default pipeline
 * - Will store the data into a local .json file (used only for debug so far)
 * - Will use Redis as the cache (only written to, not read, if enableCache is false)
 * - Will otherwise call the last step, to be added by the user
 * @param param0 
 * @returns 
 */
export function cachedPipeline<TData>({
    cacheKey,
    enableCache = true
}: {
    cacheKey: string
    enableCache?: boolean
}) {
    return pipeline<TData>(cacheKey).steps(
        fileLoggerPipelineStep(cacheKey + ".json"),
        redisPipelineStep(cacheKey, { enableCache }),
    )

}
