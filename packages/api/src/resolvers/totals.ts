import { useCache } from '../caching'
import { RequestContext, SurveyConfig } from '../types'
import config from '../config'
import { Db } from 'mongodb'

export async function getSurveyTotals(db: Db, surveyConfig: SurveyConfig, year?: Number) {
    const collection = db.collection(config.mongo.normalized_collection)
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
        all_years: async (survey: SurveyConfig, args: any, { db }: RequestContext) =>
            useCache(getSurveyTotals, db, [survey]),
        year: async (survey: SurveyConfig, { year }: { year: number }, { db }: RequestContext) =>
            useCache(getSurveyTotals, db, [survey, year])
    }
}
