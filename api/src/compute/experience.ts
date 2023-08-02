import orderBy from 'lodash/orderBy.js'
import sumBy from 'lodash/sumBy.js'
import sortBy from 'lodash/sortBy.js'
import uniq from 'lodash/uniq.js'
import config from '../config'
import { ratioToPercentage, appendCompletionToYearlyResults } from './common'
import { getEntity } from '../load/entities'
import { YearCompletion, Survey, RequestContext, Filters } from '../types'
import { generateFiltersQuery } from '../filters'
import { computeCompletionByYear } from './completion'
// import { computeYearlyTransitions, YearlyTransitionsResult } from './yearly_transitions'
import { inspect } from 'util'
import { getCollection } from '../helpers/db'

interface ExperienceBucket {
    id: string
    count: number
}

const computeAwareness = (buckets: ExperienceBucket[], total: number) => {
    const neverHeard = buckets.find(bucket => bucket.id === 'never_heard')
    if (neverHeard === undefined) {
        return 0
    }

    return ratioToPercentage((total - neverHeard.count) / total)
}

const computeUsage = (buckets: ExperienceBucket[]) => {
    const neverHeardCount = buckets.find(bucket => bucket.id === 'never_heard')?.count ?? 0
    const interestedCount = buckets.find(bucket => bucket.id === 'interested')?.count ?? 0
    const notInterestedCount = buckets.find(bucket => bucket.id === 'not_interested')?.count ?? 0
    const wouldUseCount = buckets.find(bucket => bucket.id === 'would_use')?.count ?? 0
    const wouldNotUseCount = buckets.find(bucket => bucket.id === 'would_not_use')?.count ?? 0

    const usageCount = wouldUseCount + wouldNotUseCount
    const total = usageCount + interestedCount + notInterestedCount + neverHeardCount

    return ratioToPercentage(usageCount / total)
}

const computeInterest = (buckets: ExperienceBucket[]) => {
    const interested = buckets.find(bucket => bucket.id === 'interested')
    const notInterested = buckets.find(bucket => bucket.id === 'not_interested')
    if (interested === undefined || notInterested === undefined) {
        return 0
    }

    return ratioToPercentage(interested.count / (interested.count + notInterested.count))
}

const computeSatisfaction = (buckets: ExperienceBucket[]) => {
    const wouldUse = buckets.find(bucket => bucket.id === 'would_use')
    const wouldNotUse = buckets.find(bucket => bucket.id === 'would_not_use')
    if (wouldUse === undefined || wouldNotUse === undefined) {
        return 0
    }

    return ratioToPercentage(wouldUse.count / (wouldUse.count + wouldNotUse.count))
}

export async function computeExperienceOverYears({
    context,
    survey,
    tool,
    filters
}: {
    context: RequestContext
    survey: Survey
    tool: string
    filters?: Filters
}) {
    const { db, isDebug } = context
    const collection = getCollection(db, survey)

    const path = `tools.${tool}.experience`

    const match = {
        survey: survey.id,
        [path]: { $nin: [null, ''] },
        ...generateFiltersQuery({ filters })
    }

    const pipeline = [
        {
            $match: match
        },
        {
            $group: {
                _id: {
                    experience: `$${path}`,
                    year: '$year'
                },
                total: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                experience: '$_id.experience',
                year: '$_id.year',
                total: 1
            }
        }
    ]

    const results = await collection.aggregate(pipeline).toArray()

    if (isDebug) {
        console.log('// tool')
        console.log(tool)
        console.log('// filters')
        console.log(filters)
        console.log(
            inspect(
                {
                    match,
                    pipeline,
                    results
                },
                { colors: true, depth: null }
            )
        )
    }

    const completionByYear = await computeCompletionByYear({ context, match, survey })

    // group by years and add counts
    const experienceByYear = orderBy(
        results.reduce<
            Array<{
                year: number
                total: number
                completion: Pick<YearCompletion, 'count'>
                awarenessUsageInterestSatisfaction: {
                    awareness: number
                    usage: number
                    interest: number
                    satisfaction: number
                }
                buckets: Array<{
                    id: string
                    count: number
                    countDelta?: number
                    percentageSurvey: number
                    percentageQuestion: number
                    percentageBucket: number
                    percentageDelta?: number
                }>
            }>
        >((acc, result) => {
            let yearBucket = acc.find(b => b.year === result.year)
            if (yearBucket === undefined) {
                yearBucket = {
                    year: result.year,
                    total: 0,
                    completion: {
                        count: completionByYear[result.year]?.total ?? 0
                    },
                    awarenessUsageInterestSatisfaction: {
                        awareness: 0,
                        usage: 0,
                        interest: 0,
                        satisfaction: 0
                    },
                    buckets: []
                }
                acc.push(yearBucket)
            }

            yearBucket.buckets.push({
                id: result.experience,
                count: result.total,
                percentageSurvey: 0,
                percentageQuestion: 0,
                percentageBucket: 0
            })

            return acc
        }, []),
        'year'
    )

    // compute percentages
    experienceByYear.forEach(bucket => {
        bucket.total = sumBy(bucket.buckets, 'count')
        bucket.buckets.forEach(subBucket => {
            subBucket['percentageSurvey'] = 0 // TODO
            subBucket['percentageQuestion'] = ratioToPercentage(subBucket.count / bucket.total)
            subBucket['percentageBucket'] = 0 // TODO
        })
    })

    // compute awareness/interest/satisfaction
    experienceByYear.forEach(bucket => {
        bucket.awarenessUsageInterestSatisfaction = {
            awareness: computeAwareness(bucket.buckets, bucket.total),
            usage: computeUsage(bucket.buckets),
            interest: computeInterest(bucket.buckets),
            satisfaction: computeSatisfaction(bucket.buckets)
        }
    })

    // compute deltas
    experienceByYear.forEach((year, i) => {
        const previousYear = experienceByYear.find(y => y.year === year.year - 1)
        if (previousYear) {
            year.buckets.forEach(bucket => {
                const previousYearBucket = previousYear.buckets.find(b => b.id === bucket.id)
                if (previousYearBucket) {
                    bucket.countDelta = bucket.count - previousYearBucket.count
                    bucket.percentageDelta =
                        Math.round(
                            100 * (bucket.percentageBucket - previousYearBucket.percentageBucket)
                        ) / 100
                }
            })
        }
    })

    // not sure if needed?
    return appendCompletionToYearlyResults(context, survey, experienceByYear)
}

const metrics = ['awareness', 'usage', 'interest', 'satisfaction']

export async function computeToolsExperienceRatios({
    context,
    survey,
    tools,
    filters
}: {
    context: RequestContext
    survey: Survey
    tools: string[]
    filters?: Filters
}) {
    let availableYears: any[] = []
    const metricByYear: { [key: string]: any } = {}

    for (const tool of tools) {
        const toolAllYearsExperience = await computeExperienceOverYears({
            context,
            survey,
            tool,
            filters
        })
        const toolAwarenessUsageInterestSatisfactionOverYears: any[] = []

        toolAllYearsExperience.forEach((toolYear: any) => {
            availableYears.push(toolYear.year)

            if (metricByYear[toolYear.year] === undefined) {
                metricByYear[toolYear.year] = {
                    awareness: [],
                    usage: [],
                    interest: [],
                    satisfaction: []
                }
            }

            metrics.forEach(metric => {
                metricByYear[toolYear.year][metric].push({
                    tool,
                    percentageQuestion: toolYear.awarenessUsageInterestSatisfaction[metric]
                })
            })

            toolAwarenessUsageInterestSatisfactionOverYears.push({
                year: toolYear.year,
                ...toolYear.awarenessUsageInterestSatisfaction
            })
        })
    }

    for (const yearMetrics of Object.values(metricByYear)) {
        metrics.forEach(metric => {
            yearMetrics[metric] = sortBy(yearMetrics[metric], 'percentageQuestion').reverse()
            yearMetrics[metric].forEach((bucket: any, index: number) => {
                // make ranking starts at 1
                bucket.rank = index + 1
            })
        })
    }

    availableYears = uniq(availableYears).sort()

    const byTool: any[] = []
    for (const tool of tools) {
        const entity = await getEntity({ id: tool })
        byTool.push({
            id: tool,
            entity,
            ...metrics.reduce((acc, metric) => {
                return {
                    ...acc,
                    [metric]: availableYears.map(year => {
                        const toolYearMetric = metricByYear[year][metric].find(
                            (d: any) => d.tool === tool
                        )
                        let rank = null
                        let percentageQuestion = null
                        if (toolYearMetric !== undefined) {
                            rank = toolYearMetric.rank
                            percentageQuestion = toolYearMetric.percentageQuestion
                        }

                        return { year, rank, percentageQuestion }
                    })
                }
            }, {})
        })
    }

    return byTool
}
