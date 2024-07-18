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
import { NormalizationMetadata, RawDataItem } from '@devographics/types'

type GetRawDataOptions = {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    question: QuestionApiObject
    context: RequestContext
    token?: string
}

export const getRawData = async ({
    survey,
    edition,
    section,
    question,
    context,
    token
}: GetRawDataOptions) => {
    const { db } = context
    const collection = getCollection(db, survey)
    const { normPaths } = question
    if (normPaths?.metadata) {
        const metadata = normPaths.metadata as string
        const normalized = normPaths.other as string

        const selector = { editionId: edition.id, [metadata]: { $exists: true, $ne: '' } }
        if (token) {
            // if token is specified, only get responses that contain it
            selector[normalized] = token
        }
        const projection = { _id: 1, [metadata]: 1, [normalized]: 1 }

        const results = await collection.find(selector, { projection }).toArray()
        let data: RawDataItem[] = results
            .map(response => {
                const answers = get(response, metadata) as NormalizationMetadata[]

                return answers.map(answer => ({
                    ...answer,
                    responseId: response._id.toString()
                }))
            })
            .flat()

        if (token) {
            // since we can have multiple answers per response, some of them might
            // not contain the token we're filtering by, or even no tokens at all
            data = data.filter(
                answer => answer.tokens && answer.tokens.map(t => t.id).includes(token)
            )
        }

        return data
    }
}
