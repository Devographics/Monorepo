import { initEntities, cacheSurveysEntities } from './entities'
import { initSurveys } from './surveys'
import { initProjects } from './projects'
import { RequestContext } from './types'

export const init = async ({ context }: { context: RequestContext }) => {
    const entities = await initEntities()

    const surveys = await initSurveys()

    await cacheSurveysEntities({
        surveys,
        entities,
        context
    })

    await initProjects({ context })
}
