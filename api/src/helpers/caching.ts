import { RequestContext } from '../types'
import { AppSettings } from './settings'

import NodeCache from 'node-cache'
import { appSettings } from '../server'
const nodeCache = new NodeCache()
import compact from 'lodash/compact.js'
import fs from 'fs'
import path from 'path'
import { logToFile } from '@devographics/debug'

const cacheDir = `.cache`

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
    if (typeof enableCache !== 'undefined') {
        // if cache is specified through query parameters, respect that value
        return enableCache
    } else if (appSettings.disableCache || context.disableCache || context.isDebug) {
        // cache is disabled on an app-wide basis
        // or cache is disabled on a per-request basis,
        // either manually through disablecache header
        // or because this is debug mode
        return false
    } else {
        // default to enabling cache
        return true
    }
}

/**
 * Cache results in a dedicated Redis db to improve performance,
 * if the result isn't already available in the db, it will be created.
 */
export const useCache = async <F extends DynamicComputeCall>(options: {
    func: F
    context?: RequestContext
    funcOptions?: any
    // args?: ArgumentTypes<F>
    key?: string
    enableCache?: boolean
    enableLog?: boolean
}): Promise<ResultType<F>> => {
    const startedAt = new Date()
    const { func, context, key, funcOptions = {}, enableLog = true } = options
    const { redisClient, isDebug = false } = context || {}
    const { disableCache, cacheType } = appSettings
    let value, verb

    if (!key) {
        throw new Error('useCache call needs a key')
    }

    // always pass context to cached function just in case it's needed
    const funcOptionsWithContext = { ...funcOptions, context }

    const enableCache = context && getEnableCache(context, appSettings, options.enableCache)

    const settings = { isDebug, disableCache, cacheType }
    const settingsLogs = JSON.stringify(settings)

    if (enableCache) {
        const existingCachedValue = await getCache(key, context)
        if (existingCachedValue) {
            verb = '✅ Cache hit'
            value = existingCachedValue
        } else {
            verb = '⭕ Cache miss'
            value = await func(funcOptionsWithContext)
            if (value) {
                verb += ' (cache updated)'
                await setCache(key, JSON.stringify(value), context)
            }
        }
    } else {
        verb = '🟤 Cache bypass (cache disabled)'
        value = await func(funcOptionsWithContext)
        if (context && value) {
            // await setCache(key, JSON.stringify(value), context)
        }
    }
    const finishedAt = new Date()
    if (enableLog) {
        console.log(
            `> ${verb} for key: ${key} in ${
                finishedAt.getTime() - startedAt.getTime()
            }ms ( ${settingsLogs} )`
        )
    }
    return value
}

export const getCache = async (key: string, context: RequestContext) => {
    const { cacheType } = appSettings
    if (cacheType === 'local') {
        const dataFilePath = `${process.env.LOGS_PATH}/${cacheDir}/${key}.json`
        const existingData = await getLocalJSON({
            localPath: dataFilePath
        })
        return existingData
    }
    if (cacheType === 'memory') {
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
        await logToFile(`${cacheDir}/${key}.json`, value, {
            mode: 'overwrite'
        })
    } else if (cacheType === 'memory') {
        nodeCache.set(key, value)
    } else {
        try {
            await context.redisClient.set(key, JSON.stringify(value))
        } catch (error) {
            console.log(`setCache failed for key ${key} with error:`)
            console.log(error)
        }
    }
}

// export const clearCache = async (db: Db) => {
// const collection = db.collection(config.mongo.cache_collection)
// const result = await collection.deleteMany({})
// return result
// }

/*

Get a file from the disk or from GitHub

*/
export const getLocalJSON = async ({ localPath }: { localPath: string }) => {
    let contents, data
    if (fs.existsSync(localPath)) {
        contents = fs.readFileSync(localPath, 'utf8')
    }
    if (contents) {
        try {
            data = JSON.parse(contents)
        } catch (error) {
            return
        }
        return data
    }
    return
}
