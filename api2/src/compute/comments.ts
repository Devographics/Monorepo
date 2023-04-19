import { RequestContext } from '../types'
import config from '../config'
import get from 'lodash/get.js'
import uniq from 'lodash/uniq.js'
import { useCache } from '../helpers/caching'
import { Survey, QuestionApiObject } from '../types/surveys'

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
    responseId: string
    editionId: string
    sentimentScore?: number
}

const groupByEdition = (allComments: CommentObject[]) => {
    const allEditions = uniq(allComments.map((c: CommentObject) => c.editionId))
    return allEditions.map(editionId => {
        const commentsRaw = allComments.filter(c => c.editionId === editionId)
        return {
            editionId,
            commentsRaw,
            count: commentsRaw.length
        }
    })
}

interface GetRawCommentsOptions {
    survey: Survey
    question: QuestionApiObject
    context: RequestContext
    editionId?: string
}

export const getRawCommentsWithCache = async (options: GetRawCommentsOptions) => {
    const { context, ...funcOptions } = options
    return useCache({
        func: getRawComments,
        context,
        funcOptions,
        key: `${options.survey.id}.${options.question.id}.${
            options.editionId ? options.editionId : 'allEditions'
        }.comments`
    })
}

export const getRawComments = async ({
    survey,
    question,
    context,
    editionId
}: GetRawCommentsOptions) => {
    console.log('// getRawComments')

    const { db, isDebug } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const dbPath = question.dbPathComments
    if (!dbPath) {
        throw new Error(`Could not find comments dbPath for question ${survey.id}/${question.id}`)
    }

    const selector = {
        survey: survey.id,
        [dbPath]: { $exists: true },
        ...(editionId && { surveySlug: editionId })
    }
    const cursor = await collection.find(selector).project({ surveySlug: 1, [dbPath]: 1 })

    const results = await cursor.toArray()
    console.log(selector)
    console.log(results)
    const comments = results.map(r => ({
        editionId: r.surveySlug,
        message: get(r, dbPath),
        responseId: r._id
    })) as CommentObject[]
    // results = await addSentimentAnalysis(results)
    const resultsByEdition = groupByEdition(comments)
    // console.log(JSON.stringify(resultsByYear, null, 2))

    return editionId ? resultsByEdition[0] : resultsByEdition
}
