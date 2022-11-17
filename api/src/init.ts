import { initEntities, cacheSurveysEntities } from './entities'
import { initSurveys } from './surveys'
import { initProjects } from './projects'
import { RequestContext } from './types'

export const initMemoryCache = async ({ context }: { context: RequestContext }) => {
    console.log('// Initializing in-memory cache…')
    const entities = await initEntities()
    const surveys = await initSurveys()
    return { entities, surveys }
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
