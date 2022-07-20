import { Db } from 'mongodb'
import config from '../config'
import keyBy from 'lodash/keyBy'
import { RequestContext } from '../types'

export interface CompletionResult {
    year: number
    total: number
}

export async function computeCompletionByYear(
    context: RequestContext,
    match: any
): Promise<Record<number, CompletionResult>> {
    const { db } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const aggregationPipeline = [
        {
            $match: match
        },
        {
            $group: {
                _id: { year: '$year' },
                total: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                year: '$_id.year',
                total: 1
            }
        }
    ]

    const completionResults = (await collection
        .aggregate(aggregationPipeline)
        .toArray()) as CompletionResult[]

    // console.log(
    //     inspect(
    //         {
    //             aggregationPipeline,
    //             completionResults,
    //         },
    //         { colors: true, depth: null }
    //     )
    // )

    return keyBy(completionResults, 'year')
}
