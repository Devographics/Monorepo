import { Db } from 'mongodb'
import sortBy from 'lodash/sortBy.js'
import { RequestContext, SurveyConfig } from '../types'
import config from '../config'

/**
 * Structure of the documents
 * returned by the Mongo aggregation.
 */
export type YearlyTransitionAgg<Choice> = {
    previous_year: number
    previous_choice: Choice
    next_year: number
    next_choice: Choice
    count: number
}

export type YearlyTransitionNode<Choice> = {
    // the id is composed of the year + the choice.
    id: string
    year: number
    choice: Choice
    count: number
}

export type YearlyTransition<Choice> = {
    from: YearlyTransitionNode<Choice>
    to: YearlyTransitionNode<Choice>
    count: number
    // Percentage relative to the `from` node.
    percentage: number
}

export type YearlyTransitionChoiceSort<Choice> = (choice: Choice) => number

export type YearlyTransitionsResult<Choice> = {
    nodes: YearlyTransitionNode<Choice>[]
    // Differ from `YearlyTransition` as we use node ids
    // rather than objects.
    transitions: {
        from: YearlyTransitionNode<Choice>['id']
        to: YearlyTransitionNode<Choice>['id']
        count: number
        percentage: number
    }[]
}

/**
 * Compute transitions from one answer to another from one year to the next.
 *
 * In order to achieve this we rely on the user hash, which can be used
 * to identify a unique user.
 *
 * We currently only support 2 years, and those years should be consecutive.
 *
 * `key` is the path to the answer you want to track,
 * for example: `tools.react.experience`.
 *
 * While `sortChoices` is not mandatory, you might want to specify it,
 * especially if you plan to use the data returned by this method
 * for charts sensitive to the order of the data such as sankey charts.
 */
export const computeYearlyTransitions = async <Choice>(
    context: RequestContext,
    survey: SurveyConfig,
    key: string,
    years: [number, number],
    sortChoices?: YearlyTransitionChoiceSort<Choice>
): Promise<YearlyTransitionsResult<Choice>> => {
    const collection = context.db.collection(config.mongo.normalized_collection)

    const pipeline = [
        {
            $match: {
                survey: survey.survey,
                year: { $in: years },
                'user_info.hash': { $nin: [null, ''] },
                [`${key}`]: { $nin: [null, '', []] },
            },
        },
        // simplify documents to only get what we're interested in:
        // - the user hash
        // - the year
        // - what the user chose
        {
            $project: {
                _id: 0,
                hash: '$user_info.hash',
                year: '$year',
                choice: `$${key}`
            }
        },
        // make sure years are ordered.
        { $sort: { year: 1 } },
        // group documents by user hash.
        {
            $group: {
                _id: '$hash',
                years: {
                    $push: {
                        year: '$year',
                        choice: '$choice'
                    }
                }
            }
        },
        // add the number of years for filtering.
        {
            $project: {
                years: 1,
                year_count: {
                    $size: '$years'
                }
            }
        },
        // exclude users who only answered for 1 year.
        { $match: { year_count: { $gte: 2 } } },
        // transform the array of previous/next years to 2 distinct objects.
        {
            $project: {
                previous: {
                    $arrayElemAt: ['$years', 0]
                },
                next: {
                    $arrayElemAt: ['$years', 1]
                }
            }
        },
        // flatten previous/next years.
        {
            $project: {
                previous_year: '$previous.year',
                previous_choice: '$previous.choice',
                next_year: '$next.year',
                next_choice: '$next.choice'
            }
        },
        // group by pairs.
        {
            $group: {
                _id: {
                    previous_year: '$previous_year',
                    previous_choice: '$previous_choice',
                    next_year: '$next_year',
                    next_choice: '$next_choice'
                },
                count: {
                    $sum: 1
                }
            }
        },
        // flatten documents
        {
            $project: {
                _id: 0,
                previous_year: '$_id.previous_year',
                previous_choice: '$_id.previous_choice',
                next_year: '$_id.next_year',
                next_choice: '$_id.next_choice',
                count: '$count'
            }
        }
    ]

    const nodesMap: Record<string, YearlyTransitionNode<Choice>> = {}
    const transitionsMap: Record<string, YearlyTransition<Choice>> = {}

    const aggs = await collection.aggregate<YearlyTransitionAgg<Choice>>(pipeline).toArray()
    aggs.forEach(agg => {
        const previousId = `${agg.previous_year}_${agg.previous_choice}`
        if (!nodesMap[previousId]) {
            nodesMap[previousId] = {
                id: previousId,
                year: agg.previous_year,
                choice: agg.previous_choice,
                count: 0,
            }
        }
        nodesMap[previousId].count += agg.count

        const nextId = `${agg.next_year}_${agg.next_choice}`
        if (!nodesMap[nextId]) {
            nodesMap[nextId] = {
                id: nextId,
                year: agg.next_year,
                choice: agg.next_choice,
                count: 0,
            }
        }
        nodesMap[nextId].count += agg.count

        const transitionId = `${previousId}-${nextId}`
        transitionsMap[transitionId] = {
            from: nodesMap[previousId],
            to: nodesMap[nextId],
            count: agg.count,
            percentage: 0,
        }
    })

    let nodes = Object.values(nodesMap)
    // apply custom choice sorting if available
    if (sortChoices) {
        nodes = sortBy(nodes, (bucket) => sortChoices(bucket.choice))
    }
    // sort nodes by year
    nodes = sortBy(nodes, 'year')

    let transitions = Object.values(transitionsMap)
    // apply custom choice sorting if available
    if (sortChoices) {
        transitions = sortBy(transitions, (transition) => sortChoices(transition.to.choice))
        transitions = sortBy(transitions, (transition) => sortChoices(transition.from.choice))
    }

    // compute the percentage for each transition, from the source node.
    transitions.forEach(transition => {
        transition.percentage = Math.round(transition.count / transition.from.count * 100)
    })

    return {
        nodes,
        transitions: transitions.map(transition => ({
            ...transition,
            from: transition.from.id,
            to: transition.to.id,
        })),
    }
}
