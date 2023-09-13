import { Survey } from '@devographics/types'
import { Db } from 'mongodb'
import { SurveyApiObject } from '../types'

export const getCollection = (db: Db, survey: Survey | SurveyApiObject) => {
    if (!survey.normalizedCollectionName) {
        throw new Error(`Missing normalizedCollectionName for survey ${survey.id}`)
    }
    const collection = db.collection(survey.normalizedCollectionName)
    return collection
}
