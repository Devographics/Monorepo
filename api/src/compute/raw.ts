/*

Retun the raw data for a question

*/

import {
    EditionApiObject,
    QuestionApiObject,
    RequestContext,
    SectionApiObject,
    SurveyApiObject
} from '../types'
import { getCollection } from '../helpers/db'
import get from 'lodash/get.js'

type GetRawDataOptions = {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    question: QuestionApiObject
    context: RequestContext
}

export const getRawData = async ({
    survey,
    edition,
    section,
    question,
    context
}: GetRawDataOptions) => {
    const { db } = context
    const collection = getCollection(db, survey)
    const { normPaths } = question
    if (normPaths?.raw) {
        const raw = normPaths.raw as string

        const selector = { editionId: edition.id, [raw]: { $exists: true, $ne: '' } }
        const projection = { _id: 1, [raw]: 1 }

        const results = await collection.find(selector, { projection }).toArray()
        const data = results.map(response => ({
            responseId: response._id,
            content: get(response, raw)
        }))

        return data
    }
}
