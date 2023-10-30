import { initEntities, cacheSurveysEntities } from './load/entities'
import { initSurveys } from './load/surveys'
import { initProjects } from './load/projects'
import { initLocales } from './load/locales'
import { RequestContext, WatchedItem } from './types'
import { applyEntityResolvers } from './load/entities'
import { cacheSurveys } from './load/surveys'

type InitFunctionsType = {
    [k in WatchedItem]?: any
}

/**
 * Those functions have side effects
 */
const initFunctions: InitFunctionsType = {
    locales: initLocales,
    entities: initEntities,
    surveys: initSurveys
}

interface InitProps {
    context: RequestContext
    initList?: WatchedItem[]
}

const defaultInitList: WatchedItem[] = ['entities', 'surveys']

/**
 * Returns the cached data
 * NOTE: this function doesn't cache per-se,
 * it delegates the actual caching to each "initFunction"
 */
export const initMemoryCache = async ({ context, initList = defaultInitList }: InitProps) => {
    console.log(`// Initializing in-memory cache for ${initList.join(', ')}…`)
    const data: any = {}
    for (const initFunctionName of initList) {
        const f = initFunctions[initFunctionName]
        const result = await f({ context })
        data[initFunctionName] = result
    }
    return data
}

interface InitDbCacheProps extends InitProps {
    data: any
}

export const initDbCache = async ({
    context,
    data,
    initList = defaultInitList
}: InitDbCacheProps) => {
    console.log(`// Initializing db cache… (${initList.join()})`)
    const { surveys, entities } = data
    if (initList.includes('entities')) {
        const { entities } = data
        for (let e of entities) {
            e = await applyEntityResolvers(e, context)
        }
        await cacheSurveysEntities({
            surveys,
            entities,
            context
        })
    }
    if (initList.includes('surveys')) {
        await cacheSurveys({
            surveys,
            context
        })
    }
    if (initList.includes('projects')) {
        await initProjects({ context })
    }
}

export const reinitialize = async ({ context, initList = defaultInitList }: InitProps) => {
    const data = await initMemoryCache({ context, initList })
    // June 2023: we do not "warm" the cache from API app anymore,
    // it is now the responsibility of each app to handle its own cache
    // await initDbCache({ context, data, initList })
}
