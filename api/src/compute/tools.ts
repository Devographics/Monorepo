import { inspect } from 'util'
import { Db } from 'mongodb'
import { SurveyConfig } from '../types'
import { Filters } from '../filters'
import config from '../config'
import { computeChoicesOverYearsGraph } from './choices_over_years_graph'
import { getParticipationByYearMap } from './demographics'

export const allToolExperienceIds = [
    'would_use',
    'would_not_use',
    'interested',
    'not_interested',
    'never_heard'
] as const
export type ToolExperienceId = typeof allToolExperienceIds[number]

export const allToolCompoundExperienceIds = [
    // `would_use` + `would_not_use` VS total
    'usage',
    // `would_use` + `interested` VS `would_use` + `would_not_use` + `interested` + `not_interested`
    'positive_sentiment',
    // `would_not_use` + `not_interested` VS `would_use` + `would_not_use` + `interested` + `not_interested`
    'negative_sentiment',
    // `would_use` VS `would_not_use`
    'satisfaction',
    // `interested` VS `not_interested`
    'interest',
    // `never_heard` VS total (inverted)
    'awareness'
] as const
export type ToolCompoundExperienceId = typeof allToolCompoundExperienceIds[number]

export type ToolExperienceFilterId = ToolExperienceId | ToolCompoundExperienceId

export const toolExperienceConfigById: Record<
    ToolExperienceFilterId,
    Readonly<{
        predicate: ToolExperienceId | { $in: Readonly<ToolExperienceId[]> }
        comparisonPredicate: ToolExperienceId | { $in: Readonly<ToolExperienceId[]> }
    }>
> = {
    would_use: {
        predicate: 'would_use',
        comparisonPredicate: { $in: allToolExperienceIds }
    },
    would_not_use: {
        predicate: 'would_not_use',
        comparisonPredicate: { $in: allToolExperienceIds }
    },
    interested: {
        predicate: 'interested',
        comparisonPredicate: { $in: allToolExperienceIds }
    },
    not_interested: {
        predicate: 'not_interested',
        comparisonPredicate: { $in: allToolExperienceIds }
    },
    never_heard: {
        predicate: 'never_heard',
        comparisonPredicate: { $in: allToolExperienceIds }
    },
    usage: {
        predicate: { $in: ['would_use', 'would_not_use'] },
        comparisonPredicate: { $in: allToolExperienceIds }
    },
    positive_sentiment: {
        predicate: { $in: ['would_use', 'interested'] },
        comparisonPredicate: {
            $in: ['would_use', 'would_not_use', 'interested', 'not_interested']
        }
    },
    negative_sentiment: {
        predicate: { $in: ['would_not_use', 'not_interested'] },
        comparisonPredicate: {
            $in: ['would_use', 'would_not_use', 'interested', 'not_interested']
        }
    },
    satisfaction: {
        predicate: 'would_use',
        comparisonPredicate: {
            $in: ['would_use', 'would_not_use']
        }
    },
    interest: {
        predicate: 'interested',
        comparisonPredicate: {
            $in: ['interested', 'not_interested']
        }
    },
    awareness: {
        predicate: {
            $in: ['would_use', 'would_not_use', 'interested', 'not_interested']
        },
        comparisonPredicate: { $in: allToolExperienceIds }
    }
} as const

export async function computeToolExperienceGraph(
    db: Db,
    survey: SurveyConfig,
    tool: string,
    filters?: Filters
) {
    const field = `tools.${tool}.experience`

    const { nodes, links } = await computeChoicesOverYearsGraph(db, survey, field, filters)

    return {
        // remap for experience
        nodes: nodes.map(node => ({
            id: node.id,
            year: node.year,
            experience: node.choice
        })),
        links
    }
}

export async function computeToolsCardinalityByUser(
    db: Db,
    survey: SurveyConfig,
    year: number,
    toolIds: string[],
    experienceId: ToolExperienceId
) {
    const pipeline = [
        {
            // filter on specific survey and year.
            $match: {
                survey: survey.survey,
                year,
            }
        },
        {
            // for each specified tool ID, convert to 1
            // if the experience matches `experienceId`,
            // 0 otherwise.
            $project: toolIds.reduce((acc, toolId) => {
                return {
                    ...acc,
                    [toolId]: {
                        $cond: {
	                        if: {
	                            $eq: [
	                                `$tools.${toolId}.experience`,
                                    experienceId
                                ]
                            },
	                        then: 1,
                            else: 0
	                    }
                    },
                }
            }, {})
        },
        {
            // compute cardinality for each document
            $project: {
                cardinality: {
                    $sum: toolIds.map(toolId => `$${toolId}`)
                }
            }
        },
        {
            // aggregate cardinality
            $group: {
                _id: "$cardinality",
                count: { $sum: 1 }
            }
        },
        {
            // rename fields
            $project: {
                cardinality: '$_id',
                count: '$count'
            }
        },
        {
            // exclude 0 cardinality
            $match: {
                cardinality: {
                    $gt: 0,
                },
            },
        },
        {
            // higher cardinality first
            $sort: {
                cardinality: -1
            }
        }
    ]

    const results = await db.collection(config.mongo.normalized_collection).aggregate<{
        _id: number
        cardinality: number
        count: number
    }>(pipeline).toArray()

    if (results.length === 0) {
        return []
    }

    const totalRespondentsByYear = await getParticipationByYearMap(db, survey)
    const numberOfRespondents = totalRespondentsByYear[year]
    if (numberOfRespondents === undefined) {
        throw new Error(`unable to find number of respondents for year: ${year}`)
    }

    const resultsWithPercentage = results.map(result => ({
        cardinality: result.cardinality,
        count: result.count,
        percentage: result.count / numberOfRespondents * 100
    }))

    // console.log(inspect({ numberOfRespondents, pipeline, results, resultsWithPercentage }, { colors: true, depth: null }))

    return resultsWithPercentage
}