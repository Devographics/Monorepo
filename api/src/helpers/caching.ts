import { RequestContext } from '../types'

import NodeCache from 'node-cache'
const nodeCache = new NodeCache()
import compact from 'lodash/compact.js'
import fs from 'fs'
import path from 'path'
import { logToFile } from '@devographics/debug'
import { EnvVar, getEnvVar } from '@devographics/helpers'

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

    return `${getEnvVar(EnvVar.APP_NAME)}__func_${name}(${serializedOptions})`
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
    enableLog?: boolean
}): Promise<ResultType<F>> => {
    const startedAt = new Date()
    const { func, context, key, funcOptions = {}, enableLog = true } = options
    const { isDebug = false } = context || {}

    const cacheType = getEnvVar(EnvVar.CACHE_TYPE, { default: 'local' })
    const envDisableCache = getEnvVar(EnvVar.DISABLE_CACHE, { default: true })

    // else default to enabling cache
    let enableCache = true
    if (typeof options.enableCache !== 'undefined') {
        // set to value of options.enableCache if it's defined
        enableCache = options.enableCache
    } else if (envDisableCache || context?.disableCache || isDebug) {
        // but disable it if needed
        enableCache = false
    }

    let value, verb

    if (!key) {
        throw new Error('useCache call needs a key')
    }

    // always pass context to cached function just in case it's needed
    const funcOptionsWithContext = { ...funcOptions, context }

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
        const settings = { isDebug, enableCache, cacheType }
        const settingsLogs = JSON.stringify(settings)
        console.log(
            `> ${verb} for key: ${key} in ${
                finishedAt.getTime() - startedAt.getTime()
            }ms ( ${settingsLogs} )`
        )
    }
    return value
}

const defaultLogsPath = './logs'

export const getCache = async (key: string, context: RequestContext) => {
    const cacheType = getEnvVar(EnvVar.CACHE_TYPE, { default: 'local' })
    if (cacheType === 'local') {
        const dataFilePath = `${getEnvVar(EnvVar.LOGS_PATH, {
            default: defaultLogsPath
        })}/${cacheDir}/${key}.json`
        const existingData = await getLocalJSON({
            localPath: dataFilePath
        })
        return existingData
    }
    if (cacheType === 'memory') {
        const value: string | undefined = nodeCache.get(key)
        return value && JSON.parse(value)
    } else {
        try {
            const value = await context.redisClient.get(key)
            let parsedValue = JSON.parse(value)
            if (typeof parsedValue === 'string') {
                // somehow cached values can get "over-stringified"?
                // see https://stackoverflow.com/a/51955729/649299
                parsedValue = JSON.parse(parsedValue)
            }
            return parsedValue
        } catch (error) {
            console.log(`getCache failed on redis for key ${key} with error:`)
            console.log(error)
        }
    }
}

export const setCache = async (key: string, value: any, context: RequestContext) => {
    const cacheType = getEnvVar(EnvVar.CACHE_TYPE, { default: 'local' })
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
            console.log(`setCache failed on redis for key ${key} with error:`)
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
