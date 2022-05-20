import { useCache } from '../caching'
import { SurveyConfig } from '../types'
import config from '../config'
import { Db } from 'mongodb'
import type { Resolvers } from '../generated/graphql'

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

export const Totals: Resolvers['Totals'] = {
    all_years: (survey, args, { db }) =>
        useCache(getSurveyTotals, db, [survey]),
    year: (survey, { year }, { db }) =>
        useCache(getSurveyTotals, db, [survey, year])
}

