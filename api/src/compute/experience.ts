import _ from 'lodash'
import { Db } from 'mongodb'
import config from '../config'
import { ratioToPercentage, appendCompletionToYearlyResults } from './common'
import { getEntity } from '../entities'
import keys from '../data/keys.yml'
import { YearCompletion, SurveyConfig, RequestContext } from '../types'
import { Filters, generateFiltersQuery } from '../filters'
import { computeCompletionByYear } from './completion'
import { computeYearlyTransitions, YearlyTransitionsResult } from './yearly_transitions'

const EXPERIENCE_RANKING = {
    never_heard: 1,
    interested: 2,
    not_interested: 3,
    would_use: 4,
    would_not_use: 5
} as const

type ExperienceChoice = keyof typeof EXPERIENCE_RANKING

const sortExperience = (experience: ExperienceChoice) => EXPERIENCE_RANKING[experience]

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
    survey: SurveyConfig
    tool: string
    filters?: Filters
}) {
    const collection = context.db.collection(config.mongo.normalized_collection)

    const path = `tools.${tool}.experience`

    const match = {
        survey: survey.survey,
        [path]: { $nin: [null, ''] },
        ...generateFiltersQuery(filters)
    }

    const results = await collection
        .aggregate([
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
        ])
        .toArray()

    const completionByYear = await computeCompletionByYear(context, match)

    // group by years and add counts
    const experienceByYear = _.orderBy(
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
                    percentage_survey: number
                    percentage_question: number
                    percentage_facet: number
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
                percentage_survey: 0,
                percentage_question: 0,
                percentage_facet: 0
            })

            return acc
        }, []),
        'year'
    )

    // compute percentages
    experienceByYear.forEach(bucket => {
        bucket.total = _.sumBy(bucket.buckets, 'count')
        bucket.buckets.forEach(subBucket => {
            subBucket['percentage_survey'] = 0 // TODO
            subBucket['percentage_question'] = ratioToPercentage(subBucket.count / bucket.total)
            subBucket['percentage_facet'] = 0 // TODO
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
                            100 * (bucket.percentage_facet - previousYearBucket.percentage_facet)
                        ) / 100
                }
            })
        }
    })

    return appendCompletionToYearlyResults(context, survey, experienceByYear)
}

const metrics = ['awareness', 'usage', 'interest', 'satisfaction']

export async function computeToolsExperienceRanking({
    context,
    survey,
    tools,
    filters
}: {
    context: RequestContext
    survey: SurveyConfig
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
                    percentage_question: toolYear.awarenessUsageInterestSatisfaction[metric]
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
            yearMetrics[metric] = _.sortBy(yearMetrics[metric], 'percentage_question').reverse()
            yearMetrics[metric].forEach((bucket: any, index: number) => {
                // make ranking starts at 1
                bucket.rank = index + 1
            })
        })
    }

    availableYears = _.uniq(availableYears).sort()

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
                        let percentage_question = null
                        if (toolYearMetric !== undefined) {
                            rank = toolYearMetric.rank
                            percentage_question = toolYearMetric.percentage_question
                        }

                        return { year, rank, percentage_question }
                    })
                }
            }, {})
        })
    }


    return byTool
}

export async function computeToolsExperienceRankingYears({
    context,
    survey,
    tools,
    filters
}: {
    context: RequestContext
    survey: SurveyConfig
    tools: string[]
    filters?: Filters
}) {
    let availableYears: any[] = []
    for (const tool of tools) {
        const toolAllYearsExperience = await computeExperienceOverYears({
            context,
            survey,
            tool,
            filters
        })
        toolAllYearsExperience.forEach((toolYear: any) => {
            availableYears.push(toolYear.year)
        })
    }
    availableYears = _.uniq(availableYears).sort()
    return availableYears
}

export async function computeToolExperienceTransitions<ToolID extends string = string>({
    context,
    survey,
    tool,
    years
}: {
    context: RequestContext
    survey: SurveyConfig
    tool: ToolID
    years: [number, number]
}) {
    const yearlyTransitions = await computeYearlyTransitions<ExperienceChoice>(
        context,
        survey,
        `tools.${tool}.experience`,
        years,
        sortExperience
    )

    return {
        ...yearlyTransitions,
        keys: keys.tool
    }
}
