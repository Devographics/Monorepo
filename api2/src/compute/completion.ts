import config from '../config'
import { RequestContext } from '../types'
import { inspect } from 'util'

export interface CompletionResult {
    editionId: string
    total: number
}

export async function computeCompletionByYear({
    context,
    match
}: {
    context: RequestContext
    match: any
}): Promise<CompletionResult[]> {
    const { db } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const aggregationPipeline = [
        {
            $match: match
        },
        {
            $group: {
                _id: { editionId: '$surveySlug' },
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
