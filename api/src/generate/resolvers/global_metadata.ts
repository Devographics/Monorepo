import { loadOrGetSurveys } from '../../load/surveys'
import { ResolverType } from '../../types'

/*

Always get a fresh copy of `surveys` from memory

*/

export const getGlobalMetadataResolver = (): ResolverType => async (parent, args, context) => {
    console.log('// getGlobalMetadataResolver')
    const { surveyId, editionId } = args
    const isDevOrTest = !!(
        process.env.NODE_ENV && ['test', 'development'].includes(process.env.NODE_ENV)
    )
    const { surveys } = await loadOrGetSurveys()
    let filteredSurveys = surveys
    if (editionId) {
        filteredSurveys = filteredSurveys
            .map(s => ({
                ...s,
                editions: s.editions.filter(e => e.id === editionId)
            }))
            .filter(s => s.editions.length > 0)
    } else if (surveyId) {
        filteredSurveys = surveys.filter(s => s.id === surveyId)
    }
    return { surveys: filteredSurveys, general: {} }
}
