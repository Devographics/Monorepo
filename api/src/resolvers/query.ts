import { SurveyType } from '../types'
import surveys from '../surveys'

export default {
    Query: {
        allSurveys: () => surveys,
        survey: (parent: any, { survey }: { survey: SurveyType }) => ({
            survey
        }),
    }
}
