import { initLocales } from './locales_cache'
import { initEntities } from './entities'
import { RequestContext, WatchedItem } from './types'

type InitFunctionsType = {
    [k in WatchedItem]?: any
}

const initFunctions: InitFunctionsType = {
    entities: initEntities,
    locales: initLocales
}

export const initMemoryCache = async ({
    context,
    initList = ['entities', 'locales']
}: {
    context: RequestContext
    initList?: WatchedItem[]
}) => {
    console.log(`// Initializing in-memory cache for ${initList.join(', ')}…`)
    const data: any = {}
    for (const initFunctionName of initList) {
        const f = initFunctions[initFunctionName]
        const result = await f({ context })
        data[initFunctionName] = result
    }
    return data
}
