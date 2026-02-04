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
import { NormalizationMetadata, RawDataAnswer } from '@devographics/types'
import { NO_MATCH } from '@devographics/constants'
import { cleanHtmlString, parseHtmlString, sanitizeHtmlString } from '../helpers/strings'

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
        const metadataPath = normPaths.metadata as string
        const normalizedPath = normPaths.other as string

        const selector = { editionId: edition.id, [metadataPath]: { $exists: true, $ne: '' } }
        if (token) {
            // if token is specified, only get responses that contain it
            selector[normalizedPath] = token
        }
        const projection = { _id: 1, [metadataPath]: 1, [normalizedPath]: 1, createdAt: 1 }

        const results = await collection.find(selector, { projection }).toArray()
        let data: RawDataAnswer[] = results
            .map(response => {
                const answers = get(response, metadataPath) as NormalizationMetadata[]
                return answers.map((answer, answerIndex) => {
                    const { raw } = answer
                    const rawParsed = parseHtmlString(raw)
                    const rawHtml = sanitizeHtmlString(rawParsed)
                    const rawClean = cleanHtmlString(rawHtml)
                    const responseId = response._id.toString()
                    const answerId = `${responseId}___${question.id}___${answerIndex}`
                    const createdAt = response.createdAt
                    const rawAnswer: RawDataAnswer = {
                        ...answer,
                        answerIndex,
                        answerId,
                        rawHtml,
                        rawClean,
                        responseId,
                        createdAt
                    }
                    return rawAnswer
                })
            })
            .flat()

        if (token) {
            // since we can have multiple answers per response, some of them might
            // not contain the token we're filtering by, or even no tokens at all
            data = data.filter(answer => {
                if (token === NO_MATCH) {
                    return !answer.tokens
                } else {
                    return answer.tokens && answer.tokens.map(t => t.id).includes(token)
                }
            })
        }

        return data
    }
}
