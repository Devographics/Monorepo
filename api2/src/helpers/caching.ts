// import { Db } from 'mongodb'
// import config from './config'
import { RequestContext } from '../types'

import NodeCache from 'node-cache'
import { appSettings } from './settings'
const nodeCache = new NodeCache()

type DynamicComputeCall = (...args: any[]) => Promise<any>

type ArgumentTypes<F> = F extends (...args: infer A) => Promise<any> ? A : never

type ResultType<F> = F extends (...args: any[]) => infer P
    ? P extends Promise<infer R>
        ? R
        : never
    : never

/**
 * Compute a cache key from a function and its arguments,
 * the function should have a name in order to generate a proper key.
 */
export const computeKey = (func: Function, funcOptions?: any) => {
    const serializedOptions = funcOptions
        ? Object.keys(funcOptions)
              .map((key: string) => {
                  const argument = funcOptions[key]
                  return typeof argument === 'function' ? argument.name : JSON.stringify(argument)
              })
              .join(', ')
        : ''

    if (func.name === '') {
        // enforce regular function usage over arrow functions, to have a proper cache key
        // console.trace is used to be able to know where the call comes from
        console.trace(
            `found a function without name, please consider using a regular function instead of an arrow function to solve this issue as it can lead to cache mismatch`
        )
    }

    return `func_${func.name}(${serializedOptions})`
}

/**
 * Cache results in a dedicated Redis db to improve performance,
 * if the result isn't already available in the db, it will be created.
 */
export const useCache = async <F extends DynamicComputeCall>(options: {
    func: F
    context: RequestContext
    funcOptions?: any
    // args?: ArgumentTypes<F>
    key?: string
    enableCache?: boolean
}): Promise<ResultType<F>> => {
    const startedAt = new Date()
    const { func, context, key: providedKey, funcOptions = {} } = options
    const key = providedKey ?? computeKey(func, funcOptions)
    const { redisClient, isDebug = false } = context
    const { disableCache, cacheType } = appSettings
    let value, verb

    // always pass context to cached function just in case it's needed
    const funcOptionsWithContext = { ...funcOptions, context }

    const { enableCache = !disableCache && !isDebug } = options

    const settings = { isDebug, disableCache, cacheType }
    const settingsLogs = JSON.stringify(settings)

    if (enableCache) {
        const existingResult = await getCache(key, context)
        if (existingResult) {
            verb = 'using cache'
            value = existingResult
        } else {
            verb = 'computed and cached result'
            value = await func(funcOptionsWithContext)
            if (value) {
                // in case previous cached entry exists, delete it
                await setCache(key, JSON.stringify(value), context)
            }
        }
    } else {
        verb = 'computed result'
        value = await func(funcOptionsWithContext)
    }
    const finishedAt = new Date()
    console.log(
        `> ${verb} for key: ${key} in ${
            finishedAt.getTime() - startedAt.getTime()
        }ms ( ${settingsLogs} )`
    )
    return value
}

export const getCache = async (key: string, context: RequestContext) => {
    const { cacheType } = appSettings
    if (cacheType === 'local') {
        const value: string | undefined = nodeCache.get(key)
        return value && JSON.parse(value)
    } else {
        const value = await context.redisClient.get(key)
        let parsedValue = JSON.parse(value)
        if (typeof parsedValue === 'string') {
            // somehow cached values can get "over-stringified"?
            // see https://stackoverflow.com/a/51955729/649299
            parsedValue = JSON.parse(parsedValue)
        }
        return parsedValue
    }
}

export const setCache = async (key: string, value: any, context: RequestContext) => {
    const { cacheType } = appSettings
    if (cacheType === 'local') {
        nodeCache.set(key, value)
    } else {
        await context.redisClient.set(key, JSON.stringify(value))
    }
}

// export const clearCache = async (db: Db) => {
// const collection = db.collection(config.mongo.cache_collection)
// const result = await collection.deleteMany({})
// return result
// }
