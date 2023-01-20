import { SurveyType } from '../types'
import { getSurveys } from '../surveys'
import { getMetaData } from '../metadata'

export default {
    Query: {
        allSurveys: () => {
            return getSurveys()
        },
        survey: (parent: any, { survey }: { survey: SurveyType }) => ({
            survey
        }),
        metadata: async (parent, args, context) => {
            return await getMetaData({ context })
        }
    }
}
