import { SurveyType } from '../types'
import surveys from '../surveys'

export default {
    Query: {
        surveys: () => surveys,
        survey: (parent: any, { survey }: { survey: SurveyType }) => ({
            survey
        }),
    }
}
