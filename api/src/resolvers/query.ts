import { SurveyType } from '../types'
import { getSurveys } from '../surveys'

export default {
    Query: {
        allSurveys: () => {
            return getSurveys()
        },
        survey: (parent: any, { survey }: { survey: SurveyType }) => ({
            survey
        })
    }
}
