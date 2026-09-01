import { OPTION_NA } from '@devographics/types'
import { RequestContext } from '../types'
import { EditionApiObject, QuestionApiObject, SurveyApiObject } from '../types/surveys'
import { getCollection } from '../helpers/db'
import { getMultiValueDbPaths, round } from './correlations_calculations'

/*

For a multiple-choice question, compute the distribution of how many distinct
answers each respondent selected: how many people picked exactly one option,
exactly two, and so on.

Computed on the fly per question (a single grouped aggregation over the
edition's normalized responses), never precomputed for the whole survey. Always
runs over every response of the edition, so it is not affected by filters
applied to sibling fields — same contract as `_correlations`.

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

export async function getQuestionCardinalities(options: ComputeOptions): Promise<Cardinalities> {
    const { survey, edition, question, context } = options
    const { db } = context

    const dbPaths = getMultiValueDbPaths(question)
    if (dbPaths.length === 0) {
        return emptyResult
    }

    // treat a missing or non-array path as an empty selection set
    const asArray = (path: string) => ({
        $cond: [{ $isArray: [`$${path}`] }, `$${path}`, []]
    })

    const collection = getCollection(db, survey)
    const pipeline = [
        { $match: { surveyId: survey.id, editionId: edition.id } },
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
