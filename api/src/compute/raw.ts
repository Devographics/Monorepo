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
import { NormalizationMetadata } from '@devographics/types'

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
    if (normPaths?.metadata) {
        const metadata = normPaths.metadata as string

        const selector = { editionId: edition.id, [metadata]: { $exists: true, $ne: '' } }
        const projection = { _id: 1, [metadata]: 1 }

        const results = await collection.find(selector, { projection }).toArray()
        const data = results
            .map(response => {
                const answers = get(response, metadata) as NormalizationMetadata[]
                return answers.map(answer => ({
                    ...answer,
                    responseId: response._id
                }))
            })
            .flat()

        return data
    }
}
