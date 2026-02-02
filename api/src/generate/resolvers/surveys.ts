import { loadOrGetSurveys } from '../../load/surveys'
import { SurveyApiObject, ResolverType } from '../../types'

/*

Note: although a survey object is passed as argument, that object
may be stale if surveys have been reinitialized since app start.
So we only use its id and then make sure to get a "fresh"
copy of the survey metadata from memory

*/
export const getSurveyMetadataResolver =
    ({ survey }: { survey: SurveyApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log(`// survey metadata resolver: ${survey.id}`)
        const { surveys } = await loadOrGetSurveys()
        const freshSurvey = surveys.find(s => s.id === survey.id)
        return freshSurvey
    }

export const getSurveyResolver =
    ({ survey }: { survey: SurveyApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log(`// survey resolver: ${survey.id}`)
        return survey
    }
