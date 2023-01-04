import { initEntities, cacheSurveysEntities } from './entities'
import { initSurveys } from './surveys'
import { initProjects } from './projects'
import { RequestContext, WatchedItem } from './types'
import { applyEntityResolvers } from './entities'
import { cacheAvatars } from './avatars'

type InitFunctionsType = {
    [k in WatchedItem]?: any
}

const initFunctions: InitFunctionsType = {
    entities: initEntities,
    surveys: initSurveys
}

export const initMemoryCache = async ({
    context,
    initList
}: {
    context: RequestContext
    initList: WatchedItem[]
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

export const initDbCache = async ({ context, data }: { context: RequestContext; data: any }) => {
    console.log('// Initializing db cache…')
    const { surveys, entities } = data
    await cacheSurveysEntities({
        surveys,
        entities,
        context
    })

    await initProjects({ context })
}

export const reinitialize = async ({ context }: { context: RequestContext }) => {
    console.log('// reinitialize')
    const data = await initMemoryCache({ context, initList: ['entities', 'surveys'] })
    const { entities } = data

    for (let e of entities) {
        e = await applyEntityResolvers(e, context)
    }

    await initDbCache({ context, data })
}