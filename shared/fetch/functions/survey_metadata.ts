import { FetcherFunctionOptions } from '../types'
import { fetchSurveysMetadata } from './all_surveys_metadata'

export const fetchSurveyMetadata = async (
    options: FetcherFunctionOptions & { surveyId: string }
) => {
    const { surveyId } = options
    const allSurveys = await fetchSurveysMetadata()
    const survey = allSurveys.data.find(s => s.id === surveyId)

    if (!survey) {
        throw new Error(`Couldn't fetch survey ${surveyId}`)
    }
    return survey
}
