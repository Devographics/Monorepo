import { Document } from 'mongodb'
import { getAppDb } from "@devographics/mongo"

export interface SurveyformStats {
    editionId: string,
    kind: string,
    [key: string]: any
}
/**
 * Handle the connection automatically when called the first time
 * 
 * Stores one-off aggregates (currently only the score quantiles)
 */
export const getSurveyformStatsCollection = async <T extends Document = SurveyformStats>() => {
    const db = await getAppDb()
    return db.collection<T>('surveyform_stats')
}