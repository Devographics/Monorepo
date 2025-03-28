import config from '../config'
import { getCollection } from '../helpers/db'
import { RequestContext, Survey } from '../types'
import { inspect } from 'util'

export interface CompletionResult {
    editionId: string
    totalAnswers: number
    totalRespondents: number
}

const getPipeline = (match: any, dbPath: string, unwind: boolean = false) => {
    const pipeline = [
        {
            $match: match
        },
        {
            $group: {
                _id: {
                    editionId: '$editionId'
                },
                totalRespondents: {
                    $sum: 1
                },
                allNormalized: {
                    $push: `$${dbPath}`
                }
            }
        },
        {
            $unwind: {
                path: '$allNormalized'
            }
        },
        {
            $unwind: {
                path: '$allNormalized'
            }
        },
        {
            $group: {
                _id: {
                    editionId: '$_id.editionId'
                },
                totalRespondents: {
                    $first: '$totalRespondents'
                },
                totalAnswers: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                editionId: '$_id.editionId',
                totalRespondents: 1,
                totalAnswers: 1
            }
        }
    ]

    return pipeline
}
export async function computeCompletionByYear({
    context,
    match,
    survey,
    dbPath
}: {
    context: RequestContext
    match: any
    survey: Survey
    dbPath: string
}): Promise<CompletionResult[]> {
    const { db } = context
    const collection = getCollection(db, survey)

    const aggregationPipeline = getPipeline(match, dbPath)

    const completionResults = (await collection
        .aggregate(aggregationPipeline)
        .toArray()) as CompletionResult[]

    console.log('// computeCompletionByYear')
    console.log(
        inspect(
            {
                aggregationPipeline,
                completionResults
            },
            { colors: true, depth: null }
        )
    )

    return completionResults
}

// completionResults: [ { _id: { editionId: 'ai2025' }, total: 223, editionId: 'ai2025' } ]
