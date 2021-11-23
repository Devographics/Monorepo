import { inspect } from 'util'
import _ from 'lodash'
import { Db } from 'mongodb'
import config from '../config'
import { ratioToPercentage } from './common'
import { getEntity } from '../entities'
import { SurveyConfig } from '../types'
import { ToolExperienceFilterId, toolExperienceConfigById } from './tools'

export const computeToolMatrixBreakdown = async (
    db: Db,
    {
        survey,
        tool,
        experience,
        type,
        year
    }: {
        survey: SurveyConfig
        tool: string
        experience: ToolExperienceFilterId
        type: string
        year: number
    }
) => {
    const collection = db.collection(config.mongo.normalized_collection)

    const experienceKey = `tools.${tool}.experience`
    const experienceConfig = toolExperienceConfigById[experience]
    const experiencePredicate = experienceConfig.predicate
    const experienceComparisonPredicate = experienceConfig.comparisonPredicate

    let dimensionPath = `user_info.${type}`
    if (type === 'source') {
        dimensionPath = `${dimensionPath}.normalized`
    }

    const comparisonRangesAggregationPipeline = [
        {
            $match: {
                survey: survey.survey,
                year,
                [experienceKey]: experienceComparisonPredicate,
                [dimensionPath]: {
                    $exists: true,
                    $nin: [null, '']
                }
            }
        },
        {
            // group by dimension choice
            $group: {
                _id: {
                    group_by: `$${dimensionPath}`
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                id: '$_id.group_by',
                count: 1
            }
        }
    ]
    const comparisonRangesResults = await collection
        .aggregate(comparisonRangesAggregationPipeline)
        .toArray()

    const comparisonTotal = _.sumBy(comparisonRangesResults, 'count')

    const comparisonRangeById = _.keyBy(comparisonRangesResults, 'id')

    const experienceDistributionByRangeAggregationPipeline = [
        {
            $match: {
                survey: survey.survey,
                year,
                [experienceKey]: experiencePredicate,
                [dimensionPath]: {
                    $exists: true,
                    $nin: [null, '']
                }
            }
        },
        {
            $group: {
                _id: {
                    group_by: `$${dimensionPath}`
                },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                id: '$_id.group_by',
                count: 1
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]
    const experienceDistributionByRangeResults = await collection
        .aggregate(experienceDistributionByRangeAggregationPipeline)
        .toArray()

    // fetch the total number of respondents having picked
    // the given experience, and who also answered the dimension
    // question.
    const experienceTotalQuery = {
        survey: survey.survey,
        year,
        [experienceKey]: experiencePredicate,
        [dimensionPath]: {
            $exists: true,
            $nin: [null, '']
        }
    }
    const total = await collection.countDocuments(experienceTotalQuery)
    const overallPercentage = ratioToPercentage(total / comparisonTotal)

    experienceDistributionByRangeResults.forEach(bucket => {
        bucket.percentage = ratioToPercentage(bucket.count / total)

        // As we're using an intersection, it's safe to assume that
        // the dimension item is always available.
        const comparisonRange = comparisonRangeById[bucket.id]

        bucket.range_total = comparisonRange.count
        bucket.range_percentage = ratioToPercentage(bucket.count / comparisonRange.count)
        // how does the distribution for this specific experience/range compare
        // to the overall distribution for the range?
        bucket.range_percentage_delta = _.round(bucket.range_percentage - overallPercentage, 2)
    })

    // console.log(
    //     inspect(
    //         {
    //             total,
    //             comparisonTotal,
    //             comparisonRangesAggregationPipeline,
    //             experienceDistributionByRangeAggregationPipeline,
    //             overallPercentage,
    //             comparisonRangeById,
    //             id: tool,
    //             total_in_experience: total,
    //             ranges: experienceDistributionByRangeResults
    //         },
    //         { colors: true, depth: null }
    //     )
    // )

    return {
        id: tool,
        entity: await getEntity({ id: tool }),
        total: comparisonTotal,
        count: total,
        percentage: overallPercentage,
        buckets: experienceDistributionByRangeResults
    }
}

export async function computeToolsMatrix(
    db: Db,
    {
        survey,
        tools,
        experience,
        type,
        year
    }: {
        survey: SurveyConfig
        tools: string[]
        experience: ToolExperienceFilterId
        type: string
        year: number
    }
) {
    const allTools: any[] = []
    for (const tool of tools) {
        allTools.push(
            await computeToolMatrixBreakdown(db, {
                survey,
                tool,
                experience,
                type,
                year
            })
        )
    }

    return allTools
}
