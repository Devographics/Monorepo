
import { pipeline } from "./pipeline"
import { fileLoggerPipelineStep } from "./pipeline-file-logger"
import { redisPipelineStep } from "./pipeline-redis"

/**
 * Default pipeline
 * - Will store the data into a local .json file (used only for debug so far)
 * - Will use Redis as the cache
 * - Will otherwise call the last step, to be added by the user
 * @param param0 
 * @returns 
 */
export function cachedPipeline<TData>({ cacheKey }: { cacheKey: string }) {
    return pipeline<TData>(cacheKey).steps(
        fileLoggerPipelineStep(cacheKey + ".json"),
        redisPipelineStep(cacheKey),
    )

}
