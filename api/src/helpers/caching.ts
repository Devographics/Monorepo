import { RequestContext } from '../types'
import { AppSettings } from './settings'

import NodeCache from 'node-cache'
import { appSettings } from './settings'
const nodeCache = new NodeCache()
import compact from 'lodash/compact.js'

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
export const computeKey = (funcOrFuncName: Function | string, funcOptions?: any) => {
    const { parameters = {}, ...otherKeys } = funcOptions
    const { enableCache, ...validParameters } = parameters
    const validOptions = { ...otherKeys, parameters: validParameters }

    const serializedOptions = validOptions
        ? compact(
              Object.keys(funcOptions).map((key: string) => {
                  const argument = funcOptions[key]
                  return typeof argument === 'function' ? argument.name : JSON.stringify(argument)
              })
          ).join(', ')
        : ''

    const name = typeof funcOrFuncName === 'function' ? funcOrFuncName.name : funcOrFuncName
    if (!name || name === '') {
        // enforce regular function usage over arrow functions, to have a proper cache key
        // console.trace is used to be able to know where the call comes from
        console.trace(
            `found a function without name, please consider using a regular function instead of an arrow function to solve this issue as it can lead to cache mismatch; or else explicitly pass a function name as a string`
        )
    }

    return `${process.env.APP_NAME}__func_${name}(${serializedOptions})`
}

/**
 * Figure out if cache should be enabled for this request
 */
const getEnableCache = (
    context: RequestContext,
    appSettings: AppSettings,
    enableCache?: boolean
) => {
    if (appSettings.disableCache) {
        // cache is disabled on an app-wide basis
        return false
    } else if (typeof enableCache === 'undefined') {
        return context.isDebug ? false : true
    } else {
        return enableCache
    }
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
    const { func, context, key, funcOptions = {} } = options
    const { redisClient, isDebug = false } = context
    const { disableCache, cacheType } = appSettings
    let value, verb

    if (!key) {
        throw new Error('useCache call needs a key')
    }

    // always pass context to cached function just in case it's needed
    const funcOptionsWithContext = { ...funcOptions, context }

    const enableCache = getEnableCache(context, appSettings, options.enableCache)

    const settings = { isDebug, disableCache, cacheType }
    const settingsLogs = JSON.stringify(settings)

    if (enableCache) {
        const existingCachedValue = await getCache(key, context)
        if (existingCachedValue) {
            verb = '✅ Cache hit'
            value = existingCachedValue
        } else {
            verb = '⭕ Cache miss (cache updated)'
            value = await func(funcOptionsWithContext)
            if (value) {
                await setCache(key, JSON.stringify(value), context)
            }
        }
    } else {
        verb = '🟤 Cache bypass (cache updated)'
        value = await func(funcOptionsWithContext)
        if (value) {
            await setCache(key, JSON.stringify(value), context)
        }
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
        try {
            await context.redisClient.set(key, JSON.stringify(value))
        } catch (error) {
            console.log(error)
        }
    }
}

// export const clearCache = async (db: Db) => {
// const collection = db.collection(config.mongo.cache_collection)
// const result = await collection.deleteMany({})
// return result
// }
