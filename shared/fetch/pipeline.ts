/**
 * Simpler approach to build a caching pipeline
 */

/**
 * Get/set method for a given cache policy
 * 
 */
export interface FetchPipelineStep<T = unknown> {
    /**
     * Method to get the data
     * 
     * If not set, this cache is written but never read 
     * (useful for debugging)
     * 
     * If returns null or undefined, we consider it a cache miss
     */
    get?: () => Promise<T | null | undefined> | T | null | undefined,
    /**
     * Specify a method to check if there is a cached value
     * Useful if the get call is more expensive than a simple lookup
     * 
     * Edge case: if "optimizedHas" is true,
     * but the get returns null or undefined,
     * this will still be treated as a cache miss
     */
    optimizedHas?: () => Promise<boolean> | boolean,
    /**
     * Method to update the data in case of cache miss
     * 
     * If not set, this cache is never updated
     */
    set?: (val: T) => Promise<void> | void,
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
 * - when a getter returns a non null or undefined value, 
 * run the setters of previous steps to feed caches
 * and return the value
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
 * 
 * There is no try/catch logic,
 * the pipeline will throw if updating the cache
 * or getting data from one cache of the pipeline fails
 * so that we can detect issues early on
 * 
 * The first step can be a logger (set method but no get)
 * The last step should be a getter (source of truth, get method but no set)
 */
export async function runFetchPipeline<T>(steps: Array<FetchPipelineStep<T>>): Promise<T | null | undefined> {
    const previousSteps: Array<FetchPipelineStep<T>> = []
    // Invariants and misconfig
    if (!steps.length) {
        console.warn("Empty fetch pipeline, will not return any data")
    }
    if (!!steps[steps.length - 1].set) {
        console.warn("Last method of a data fetching pipeline shouldn't have a 'set' method, it is a the source of truth and not a cache")
    }
    if (steps[steps.length - 1].disabled) {
        console.warn("Last method of a data fetching pipeline not be disabled, it is the source of truth")
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
            return data
        }
    }
    // It's up to the caller to decide to throw or not
    return null
}

/**
 * Generate a fetch pipeline
 * Each step acts as a cache, or a logger, until the source of truth
 * @returns const p = pipeline().step({get:, set:}).step(); const data= await p.run()
 */
export function pipeline<T>() {
    const p: Array<FetchPipelineStep<T>> = []
    return {
        p,
        step: function (s: FetchPipelineStep<T>) {
            this.p.push(s)
            return this
        },
        steps: function (...s: Array<FetchPipelineStep<T>>) {
            this.p.push(...s)
            return this
        },
        run: function () {
            return runFetchPipeline<T>(p)
        }
    }
}
