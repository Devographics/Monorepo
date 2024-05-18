/**
 * Simpler approach to build a caching pipeline
 */

type MaybePromise<T> = Promise<T> | T

/**
 * Get/set method for a given cache policy
 * 
 * Avoid implementing parsing within "get" functions,
 * as when the parsing logic changes,
 * you may end up with cached values with an outdated data structure
 * Instead parse the data returned by the pipeline
 * 
 */
export interface FetchPipelineStep<T = unknown> {
    /**
     * Method to get the data
     * 
     * Should throw in case of error, and return only cacheable data
     * 
     * If returns null or undefined, we consider it a cache miss
     * 
     * If this function is not defined, this cache is written but never read 
     * (it's a logger for debugging purpose)
     * 
     */
    get?: () => MaybePromise<T | null | undefined>,
    /**
     * Specify a method to check if there is a cached value
     * Useful if the get call is more expensive than a simple lookup
     * 
     * Should throw in case of error, return true/false otherwise
     * 
     * Edge case: if "optimizedHas" is true,
     * but the get returns null or undefined,
     * this will still be treated as a cache miss
     */
    optimizedHas?: () => MaybePromise<boolean>,
    /**
     * Method to update the data in case of cache miss
     * 
     * If not set, this cache is never updated
     */
    set?: (val: T) => MaybePromise<void>,
    /**
     * Allow to keep the step in the list,
     * but disable it
     */
    disabled?: boolean;
    name?: string
}


/**
 * Run a data fetching pipeline:
 * - try to get the data, running each getter in sequence
 * - when a getter returns a value (not null or undefined), 
 * run the setters of previous steps to feed caches
 * - return cached data or data from the source of truth
 * 
 * Will never throw an exception in case of error,
 * but return a {data, error} object
 * 
 * /!\ This function doesn't handle concurrency
 * If it is called in parallel by multiple requests,
 * you will see as many calls to each cache
 * We suppose that concurrency is handled by the caller,
 * so that the pipeline is called when actually needed
 * 
 * Values that are not false or undefined are considered a match
 * we could extend this behaviour is the future 
 * by adding a "isMatch" method in steps
 */
export async function runFetchPipeline<T>(steps: Array<FetchPipelineStep<T>>): Promise<{ data: T | null | undefined, error: undefined }
    | { data: undefined, error: Error }> {
    try {

        const previousSteps: Array<FetchPipelineStep<T>> = []
        // Invariants and misconfig
        if (!steps.length) {
            console.warn("Empty fetch pipeline, will not return any data")
            return { data: undefined, error: new Error("Empty pipeline") }
        }
        if (!!steps[steps.length - 1].set) {
            console.warn("Last method of a data fetching pipeline shouldn't have a 'set' method, it is a the source of truth and not a cache")
            return { data: undefined, error: new Error("Found setter in pipeline source of truth") }
        }
        if (steps[steps.length - 1].disabled) {
            console.warn("Last method of a data fetching pipeline not be disabled, it is the source of truth")
            return { data: undefined, error: new Error("Disabled pipeline fetcher") }
        }

        for (const step of steps) {
            if (step.disabled) {
                console.log(`Skipping disabled step "${step.name}"`)
                continue
            }
            // Remember previous steps to later cache the values
            previousSteps.push(step)
            // Get can be undefined if we want to cache values
            // only for debugging (eg logging the fetched results)
            if (!step.get) {
                continue
            }
            if (step.optimizedHas) {
                // check if data are there, then gets them
                const hasCachedData = await step.optimizedHas()
                if (!hasCachedData) continue
            }
            const data = await step.get()
            const nonNullData = data !== null && typeof data !== 'undefined'
            if (nonNullData) {
                console.debug(`🟢 [${step.name}] data hit`)
                if (typeof nonNullData === "object" && "error" in nonNullData) {
                    console.warn(`A pipeline step (${step.name}) returned an object containing an 'error' field. 
                    This mighe be a mistake.
                    Pipeline step should throw errors in order to avoid caching them upper in the pipeline.`)
                }
                // update cache methods above in the pipeline
                // with retrieved data
                await Promise.all(
                    previousSteps
                        .filter(step => !!step.set)
                        .map(async previousStep => {
                            // @ts-ignore
                            await previousStep.set(data)
                        })
                )
                // return the data
                return { data, error: undefined }
            }
        }
        // It's up to the caller to decide to throw or not
        return { data: null, error: undefined }
    } catch (error: unknown) {
        return { data: undefined, error: error as Error }
    }
}

/**
 * Generate a fetch pipeline
 * Each step acts as a cache, or a logger, until the source of truth
 * 
 * Errors at any step should be thrown as exceptions,
 * in order to avoid caching errors
 * the pipeline runner will take care of catching them
 * 
 * @returns const p = pipeline().step({get:, set:}).step(); const data= await p.run()
 */
export function pipeline<T>() {
    const p: Array<FetchPipelineStep<T>> = []
    return {
        p,
        /**
         * Add a new step at the end of the pipeline
         * @param s 
         * @returns 
         */
        step: function (s: FetchPipelineStep<T>) {
            this.p.push(s)
            return this
        },
        /**
         * Add multiple steps at the end of the pipeline
         * @param s 
         * @returns 
         */
        steps: function (...s: Array<FetchPipelineStep<T>>) {
            this.p.push(...s)
            return this
        },
        /**
         * Add a step at the beggining with only a "set" method
         * = a logger for debugging
         * 
         * Shorcut for .step({set: ()=> {...}})
         * @param l 
         */
        logger: function (loggerFn: FetchPipelineStep<T>["set"], options?: Omit<FetchPipelineStep<T>, "set" | "get">) {
            this.p = [
                {
                    set: loggerFn,
                    name: "logger",
                    ...(options || {})
                },
                ...this.p
            ]
            return this
        },
        /**
         * Add a step with only a "get" method,
         * at the end of the pipeline
         * = the source of truth for the data
         * 
         * Shorcut for .step({get: ()=> {...}})
         * @param l 
         */
        fetcher: function (sourceFn: FetchPipelineStep<T>["get"], options?: Omit<FetchPipelineStep<T>, "set" | "get">) {
            this.p.push({
                get: sourceFn,
                name: "source",
                ...(options || {})
            })
            return this
        },
        run: function () {
            return runFetchPipeline<T>(p)
        }
    }
}
