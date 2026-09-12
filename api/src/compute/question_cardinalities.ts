import { Filters, OPTION_NA } from '@devographics/types'
import { RequestContext } from '../types'
import { EditionApiObject, QuestionApiObject, SurveyApiObject } from '../types/surveys'
import { getCollection } from '../helpers/db'
import { generateFiltersQuery } from '../filters'
import { getMultiValueDbPaths, round } from './correlations_calculations'

/*

For a multiple-choice question, compute the distribution of how many distinct
answers each respondent selected: how many people picked exactly one option,
exactly two, and so on.

Computed on the fly per question (a single grouped aggregation over the
edition's normalized responses), never precomputed for the whole survey.

Respects the filters of the field it is queried under, using the same
`generateFiltersQuery` the generic compute pipeline uses, so the two always
agree on what a filter means. That is what makes "how many workplace issues do
women report vs men" answerable: query the question twice under different
filters and compare the distributions.

Presentation parameters (cutoff, limit, sort and their facet variants) are not
applied: they choose which buckets to display, which says nothing about how many
answers a respondent selected.

A respondent's selections can be spread across several normalized paths
(predefined choices under "response", normalized freeform under "other",
prenormalized values under "prenormalized"); they are merged with $setUnion so a
value that happens to appear in two paths is only counted once. `na` is dropped:
it means "none / not applicable" rather than a real selection.

*/

export interface CardinalityBucket {
    answerCount: number
    count: number
    percentage: number
}

export interface Cardinalities {
    n: number
    mean: number
    max: number
    buckets: CardinalityBucket[]
}

interface ComputeOptions {
    survey: SurveyApiObject
    edition: EditionApiObject
    question: QuestionApiObject
    context: RequestContext
    /** Filters applied to the field this is queried under */
    filters?: Filters
    /** Needed to resolve a filter's question id to its db path */
    questionObjects?: QuestionApiObject[]
}

const emptyResult: Cardinalities = { n: 0, mean: 0, max: 0, buckets: [] }

/*

Turn the grouped aggregation output (one row per observed answer count, already
sorted ascending) into the distribution summary. Kept separate from the DB call
so the arithmetic can be unit-tested.

*/
export const buildCardinalities = (rows: Array<{ _id: number; count: number }>): Cardinalities => {
    if (rows.length === 0) {
        return emptyResult
    }
    const n = rows.reduce((sum, row) => sum + row.count, 0)
    const totalSelections = rows.reduce((sum, row) => sum + row._id * row.count, 0)
    const buckets: CardinalityBucket[] = rows.map(row => ({
        answerCount: row._id,
        count: row.count,
        percentage: round((row.count / n) * 100)
    }))
    return {
        n,
        mean: round(totalSelections / n),
        max: rows[rows.length - 1]._id,
        buckets
    }
}

/*

Whether an answer-count distribution means anything for a question. A question
that only accepts one answer would produce a distribution of nothing but 1s, so
only multiple-choice questions with readable multi-value paths qualify.

*/
export const hasCardinalities = (question: QuestionApiObject) =>
    !!question.allowMultiple && getMultiValueDbPaths(question).length > 0

export async function getQuestionCardinalities(options: ComputeOptions): Promise<Cardinalities> {
    const { survey, edition, question, context, filters, questionObjects } = options
    const { db } = context

    const dbPaths = getMultiValueDbPaths(question)
    if (dbPaths.length === 0) {
        return emptyResult
    }

    const match: Record<string, any> = { surveyId: survey.id, editionId: edition.id }
    if (filters && questionObjects) {
        const filtersQuery = generateFiltersQuery({ filters, surveyId: survey.id, questionObjects })
        // an empty $and is rejected by MongoDB, so only merge a query that has
        // something in it
        if (filtersQuery.$and?.length) {
            Object.assign(match, filtersQuery)
        }
    }

    // treat a missing or non-array path as an empty selection set
    const asArray = (path: string) => ({
        $cond: [{ $isArray: [`$${path}`] }, `$${path}`, []]
    })

    const collection = getCollection(db, survey)
    const pipeline = [
        { $match: match },
        {
            $project: {
                answerCount: {
                    $size: {
                        $setDifference: [{ $setUnion: dbPaths.map(asArray) }, [OPTION_NA]]
                    }
                }
            }
        },
        // respondents who selected nothing are not part of the distribution
        { $match: { answerCount: { $gt: 0 } } },
        { $group: { _id: '$answerCount', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]

    const rows = (await collection.aggregate(pipeline).toArray()) as Array<{
        _id: number
        count: number
    }>

    return buildCardinalities(rows)
}
