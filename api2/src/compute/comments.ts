import { RequestContext } from '../types'
import config from '../config'
import get from 'lodash/get.js'
import uniq from 'lodash/uniq.js'
import { useCache } from '../helpers/caching'
import { Survey, ParsedQuestion } from '../types/surveys'

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
    year: number
    sentimentScore?: number
}

const groupByYear = (allComments: CommentObject[]) => {
    const allYears = uniq(allComments.map((c: CommentObject) => c.year))
    return allYears.map(year => {
        const comments_raw = allComments.filter(c => c.year === year)
        return {
            year,
            comments_raw,
            count: comments_raw.length
        }
    })
}

interface GetRawCommentsOptions {
    survey: Survey
    question: ParsedQuestion
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
            options.editionId ? options.editionId : 'all_editions'
        }.comments`
    })
}

export const getRawComments = async ({
    survey,
    question,
    context,
    year
}: GetRawCommentsOptions) => {
    console.log('// getRawComments')
    console.log(survey)
    console.log(question)
    console.log(year)

    const { db, isDebug } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const dbPath = question.dbPathComments
    if (!dbPath) {
        throw new Error(`Could not find comments dbPath for question ${survey.id}/${question.id}`)
    }

    const selector = { survey: survey.id, [dbPath]: { $exists: true }, ...(year && { year }) }
    const cursor = await collection.find(selector).project({ year: 1, [dbPath]: 1 })

    const results = await cursor.toArray()
    console.log(selector)
    console.log(results)
    const comments = results.map(r => ({
        year: r.year,
        message: get(r, dbPath),
        responseId: r._id
    })) as CommentObject[]
    // results = await addSentimentAnalysis(results)
    const resultsByYear = groupByYear(comments)
    // console.log(JSON.stringify(resultsByYear, null, 2))

    return year ? resultsByYear[0] : resultsByYear
}
