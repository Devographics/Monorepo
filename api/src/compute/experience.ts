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
import { BucketUnits, Entity, RatiosUnits } from '@devographics/types'
import { computeKey, useCache } from '../helpers/caching'

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

const computeFeatureAwareness = (buckets: ExperienceBucket[], total: number) => {
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

const computeFeatureUsage = (buckets: ExperienceBucket[]) => {
    const neverHeardCount = buckets.find(bucket => bucket.id === 'never_heard')?.count ?? 0
    const knowAboutCount = buckets.find(bucket => bucket.id === 'heard')?.count ?? 0
    const usageCount = buckets.find(bucket => bucket.id === 'used')?.count ?? 0

    const total = usageCount + neverHeardCount + knowAboutCount

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
    itemId,
    type,
    years,
    filters
}: {
    context: RequestContext
    survey: Survey
    itemId: string
    type: 'tool' | 'feature'
    years?: number[]
    filters?: Filters
}) {
    const sectionId = type === 'tool' ? 'tools' : 'features'

    const { db, isDebug } = context
    const collection = getCollection(db, survey)

    const path = `${sectionId}.${itemId}.experience`

    const match = {
        surveyId: survey.id,
        [path]: { $nin: [null, ''] },
        ...generateFiltersQuery({ filters })
    }

    if (years) {
        match.year = { $in: years }
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
        console.log('// item')
        console.log(itemId)
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
                    interest?: number
                    satisfaction?: number
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
                [BucketUnits.COUNT]: result.total,
                [BucketUnits.PERCENTAGE_SURVEY]: 0,
                [BucketUnits.PERCENTAGE_QUESTION]: 0,
                [BucketUnits.PERCENTAGE_BUCKET]: 0
            })

            return acc
        }, []),
        'year'
    )

    // compute percentages
    experienceByYear.forEach(bucket => {
        bucket.total = sumBy(bucket.buckets, 'count')
        bucket.buckets.forEach(subBucket => {
            subBucket[BucketUnits.PERCENTAGE_SURVEY] = 0 // TODO
            subBucket[BucketUnits.PERCENTAGE_QUESTION] = ratioToPercentage(
                subBucket.count / bucket.total
            )
            subBucket[BucketUnits.PERCENTAGE_BUCKET] = 0 // TODO
        })
    })

    // compute awareness/interest/satisfaction
    experienceByYear.forEach(bucket => {
        bucket.awarenessUsageInterestSatisfaction =
            type === 'tool'
                ? {
                      awareness: computeAwareness(bucket.buckets, bucket.total),
                      usage: computeUsage(bucket.buckets),
                      interest: computeInterest(bucket.buckets),
                      satisfaction: computeSatisfaction(bucket.buckets)
                  }
                : {
                      awareness: computeFeatureAwareness(bucket.buckets, bucket.total),
                      usage: computeFeatureUsage(bucket.buckets)
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
                            100 *
                                (bucket[BucketUnits.PERCENTAGE_BUCKET] -
                                    previousYearBucket[BucketUnits.PERCENTAGE_BUCKET])
                        ) / 100
                }
            })
        }
    })

    // not sure if needed?
    return appendCompletionToYearlyResults(context, survey, experienceByYear)
}

export const metrics = ['awareness', 'usage', 'interest', 'satisfaction']

export type ExperienceRatioItemData = {
    [key in RatiosUnits]: Array<ExperienceRatioYearItem>
}

export interface ExperienceRatioItem extends ExperienceRatioItemData {
    id: string
    entity?: Entity
}

export interface ExperienceRatioYearItem {
    year: number
    rank: number
    percentageQuestion: number
}

export async function computeExperienceRatios({
    context,
    survey,
    itemIds,
    filters,
    rankCutoff,
    enableCache,
    years,
    type
}: {
    context: RequestContext
    survey: Survey
    itemIds: string[]
    filters?: Filters
    rankCutoff?: number
    enableCache?: boolean
    years?: number[]
    type: 'feature' | 'tool'
}) {
    let availableYears: any[] = []
    const metricByYear: { [key: string]: any } = {}

    for (const itemId of itemIds) {
        // v1: use when the entire computeExperienceRatios function is cached
        const itemAllYearsExperience = await computeExperienceOverYears({
            context,
            survey,
            itemId,
            type,
            years,
            filters
        })

        // v2: use to cache each computeExperienceOverYears call separately
        // const key = computeKey(computeExperienceOverYears, {
        //     itemId,
        //     type,
        //     filters
        // })
        // const funcOptions = {
        //         context,
        //         survey,
        //         itemId,
        //         type,
        //         filters
        //     }
        // const itemAllYearsExperience = await useCache({
        //     key,
        //     func: computeExperienceOverYears,
        //     context,
        //     funcOptions,
        //     enableCache
        // })

        const awarenessUsageInterestSatisfactionOverYears: any[] = []

        itemAllYearsExperience.forEach((itemYear: any) => {
            availableYears.push(itemYear.year)

            if (metricByYear[itemYear.year] === undefined) {
                metricByYear[itemYear.year] = {
                    awareness: [],
                    usage: [],
                    interest: [],
                    satisfaction: []
                }
            }

            metrics.forEach(metric => {
                metricByYear[itemYear.year][metric].push({
                    itemId,
                    percentageQuestion: itemYear.awarenessUsageInterestSatisfaction[metric]
                })
            })

            awarenessUsageInterestSatisfactionOverYears.push({
                year: itemYear.year,
                ...itemYear.awarenessUsageInterestSatisfaction
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

    const byItem: Array<ExperienceRatioItem> = []
    for (const itemId of itemIds) {
        const entity = await getEntity({ id: itemId })
        const item = {
            id: itemId,
            entity,
            ...metrics.reduce((acc, metric) => {
                return {
                    ...acc,
                    [metric]: availableYears.map(year => {
                        const itemYearMetric = metricByYear[year][metric].find(
                            (d: any) => d.itemId === itemId
                        )
                        let rank = null
                        let percentageQuestion = null
                        if (itemYearMetric !== undefined) {
                            rank = itemYearMetric.rank
                            percentageQuestion = itemYearMetric.percentageQuestion
                        }

                        return { year, rank, percentageQuestion }
                    })
                }
            }, {})
        } as ExperienceRatioItem
        byItem.push(item)
    }

    return byItem
}

/*

If a rank cutoff is specified, we want to look at the last year of data,
and remove any item which doesn't have any datapoints above that cutoff (i.e. a lower rank)
across all metrics for that year.

*/
export const applyRankCutoff = (data: Array<ExperienceRatioItem>, rankCutoff: number) => {
    if (rankCutoff) {
        data = data.filter(item => {
            let hasOneOrMoreDatapointsAboveCutoff = false
            Object.values(RatiosUnits).forEach(metric => {
                const lastYearData = item[metric].at(-1)
                // don't take into account metrics that don't have a percentageQuestion field
                const yearHasDataAboveCutoff =
                    lastYearData &&
                    typeof lastYearData.percentageQuestion !== 'undefined' &&
                    lastYearData.rank <= rankCutoff
                if (yearHasDataAboveCutoff) {
                    hasOneOrMoreDatapointsAboveCutoff = true
                }
            })
            return hasOneOrMoreDatapointsAboveCutoff
        })
    }
    return data
}
