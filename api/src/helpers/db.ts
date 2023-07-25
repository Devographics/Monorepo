import { Survey } from '@devographics/types'
import { Db } from 'mongodb'
import { SurveyApiObject } from '../types'

export const getCollection = (db: Db, survey: Survey | SurveyApiObject) => {
    if (!survey.dbCollectionName) {
        throw new Error(`Missing dbCollectionName for survey ${survey.id}`)
    }
    const collection = db.collection(survey.dbCollectionName)
    return collection
}
