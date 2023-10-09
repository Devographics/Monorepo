import { Survey } from '@devographics/types'
import { Db } from 'mongodb'
import { SurveyApiObject } from '../types'

export const getCollection = (db: Db, survey: Survey | SurveyApiObject) => {
    const normalizedCollectionName = survey?.normalizedCollectionName || 'normalized_responses'
    const collection = db.collection(normalizedCollectionName)
    return collection
}
