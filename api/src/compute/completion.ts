import config from '../config'
import { getCollection } from '../helpers/db'
import { RequestContext, Survey } from '../types'
import { inspect } from 'util'

export interface CompletionResult {
    editionId: string
    total: number
}

export async function computeCompletionByYear({
    context,
    match,
    survey
}: {
    context: RequestContext
    match: any
    survey: Survey
}): Promise<CompletionResult[]> {
    const { db } = context
    const collection = getCollection(db, survey)

    const aggregationPipeline = [
        {
            $match: match
        },
        {
            $group: {
                _id: { editionId: '$editionId' },
                total: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                editionId: '$_id.editionId',
                total: 1
            }
        }
    ]

    const completionResults = (await collection
        .aggregate(aggregationPipeline)
        .toArray()) as CompletionResult[]

    // console.log('// computeCompletionByYear')
    // console.log(
    //     inspect(
    //         {
    //             aggregationPipeline,
    //             completionResults
    //         },
    //         { colors: true, depth: null }
    //     )
    // )

    return completionResults
}
