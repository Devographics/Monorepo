import config from '../config'
import { getCollection } from '../helpers/db'
import { RequestContext, Survey } from '../types'
import { inspect } from 'util'
import { logToFile } from '@devographics/debug'
import { getMatch } from './generic'

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
    matchOptions,
    survey,
    dbPath,
    logPath,
    isDebug
}: {
    context: RequestContext
    matchOptions: any
    survey: Survey
    dbPath: string
    logPath: string
    isDebug: boolean
}): Promise<CompletionResult[]> {
    const { db } = context
    const collection = getCollection(db, survey)

    // todo: actually do this
    // at the match stage we want to know the total number of
    // survey respondents, not just those who filled out the question
    const match = await getMatch({ ...matchOptions, testForNull: true })
    const aggregationPipeline = getPipeline(match, dbPath)

    const completionResults = (await collection
        .aggregate(aggregationPipeline)
        .toArray()) as CompletionResult[]

    if (isDebug) {
        await logToFile(`${logPath}/completion_pipeline.json`, aggregationPipeline)
        await logToFile(`${logPath}/completion_results.json`, completionResults)
    }

    return completionResults
}

// completionResults: [ { _id: { editionId: 'ai2025' }, total: 223, editionId: 'ai2025' } ]
