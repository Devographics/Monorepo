import { RequestContext, SurveyApiObject } from '../types'
import config from '../config'
import get from 'lodash/get.js'
import uniq from 'lodash/uniq.js'
import { useCache } from '../helpers/caching'
import { Survey, QuestionApiObject } from '../types/surveys'
import { getCollection } from '../helpers/db'
import { calculateWordFrequencies } from '@devographics/helpers'
import marked from 'marked'
import { cleanHtmlString, parseHtmlString, sanitizeHtmlString } from '../helpers/strings'

// note currently working because of "Dynamic require of "util" is not supported" error

// const natural = require('natural');
// const { SentimentAnalyzer, PorterStemmer, WordTokenizer } = natural

// const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn')
// const tokenizer = new WordTokenizer();

// const addSentimentAnalysis = async (results: CommentObject[]) => {
//     return results.map(r => {
//         const tokenizedComment = tokenizer.tokenize(r.comment);
//         const sentimentScore = analyzer.getSentiment(tokenizedComment)
//         return { ...r, sentimentScore }
//     })
// }

type CommentObject = {
    message: string
    messageHtml: string
    messageClean: string
    responseId: string
    editionId: string
    responseValue?: string | string[] | number | number[]
    experience?: string
    sentiment?: string
    sentimentScore?: number
}

const groupByEdition = (allComments: CommentObject[]) => {
    const allEditions = uniq(allComments.map((c: CommentObject) => c.editionId))
    return allEditions.map(editionId => {
        const commentsRaw = allComments.filter(c => c.editionId === editionId)
        const commentsStats = calculateWordFrequencies(commentsRaw.map(c => c.message))
        return {
            editionId,
            commentsRaw,
            count: commentsRaw.length,
            commentsStats
        }
    })
}

interface GetRawCommentsOptions {
    survey: SurveyApiObject
    question: QuestionApiObject
    context: RequestContext
    editionId?: string
    args?: any
}

export const getRawCommentsWithCache = async (options: GetRawCommentsOptions) => {
    const { context, args, ...funcOptions } = options
    const { parameters = {} } = args
    const { enableCache } = parameters
    return useCache({
        func: getRawComments,
        context,
        funcOptions,
        key: `api__${options.survey.id}__${options.question.id}__${
            options.editionId ? options.editionId : 'allEditions'
        }__comments`,
        enableCache
    })
}

export const getRawComments = async ({
    survey,
    question,
    context,
    editionId
}: GetRawCommentsOptions) => {
    console.log('// getRawComments')

    const surveyId = survey.id

    const { db, isDebug } = context
    const collection = getCollection(db, survey)

    const {
        comment: commentPath,
        experience: experiencePath,
        sentiment: sentimentPath,
        response: responsePath
    } = question?.normPaths || {}

    if (!commentPath) {
        throw new Error(`Could not find comments dbPath for question ${survey.id}/${question.id}`)
    }

    const selector = {
        surveyId,
        [commentPath]: { $exists: true },
        ...(editionId && { editionId })
    }
    const cursor = await collection.find(selector)

    const results = await cursor.toArray()

    // console.log(selector)
    // console.log(JSON.stringify(results, null, 2))

    const comments = results.map(r => {
        const message = get(r, commentPath) as string
        const messageParsed = parseHtmlString(message)
        const messageHtml = sanitizeHtmlString(messageParsed)
        const messageClean = cleanHtmlString(messageHtml)

        const comment: CommentObject = {
            editionId: r.editionId,
            message,
            messageHtml,
            messageClean,
            responseId: r._id as unknown as string
        }
        if (responsePath) {
            comment.responseValue = get(r, responsePath)
        }
        if (experiencePath) {
            comment.experience = get(r, experiencePath)
        }
        if (sentimentPath) {
            comment.sentiment = get(r, sentimentPath!)
        }
        return comment
    })
    // results = await addSentimentAnalysis(results)
    const resultsByEdition = groupByEdition(comments)
    // console.log(JSON.stringify(resultsByYear, null, 2))
    return editionId ? resultsByEdition[0] : resultsByEdition
}
