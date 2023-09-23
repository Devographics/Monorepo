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

        const results = await collection
            .find({ [raw]: { $exists: true } }, { projection: { [raw]: 1 } })
            .toArray()
        const data = results.map(response => ({
            content: get(response, raw)
        }))

        return data
    }
}
