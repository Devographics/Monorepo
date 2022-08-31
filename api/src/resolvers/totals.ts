import { useCache } from '../caching'
import { RequestContext, SurveyConfig } from '../types'
import config from '../config'
import { Db } from 'mongodb'

export async function getSurveyTotals({
    context,
    surveyConfig,
    year
}: {
    context: RequestContext
    surveyConfig: SurveyConfig
    year?: Number
}) {
    const collection = context.db.collection(config.mongo.normalized_collection)
    let selector: any = {
        survey: surveyConfig.survey
    }
    if (year) {
        selector = { ...selector, year }
    }
    return collection.countDocuments(selector)
}

export default {
    Totals: {
        all_years: async (survey: SurveyConfig, args: any, context: RequestContext) =>
            useCache({ func: getSurveyTotals, context, funcOptions: { survey } }),
        year: async (survey: SurveyConfig, { year }: { year: number }, context: RequestContext) =>
            useCache({ func: getSurveyTotals, context, funcOptions: { survey, year } })
    }
}
