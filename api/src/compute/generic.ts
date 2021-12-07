import { Db } from 'mongodb'
import { inspect } from 'util'
import config from '../config'
import { YearCompletion, FacetCompletion, SurveyConfig, Entity } from '../types'
import { Filters, generateFiltersQuery } from '../filters'
import { Facet } from '../facets'
import { ratioToPercentage } from './common'
import { getEntity } from '../entities'
import { getParticipationByYearMap } from './demographics'
import { useCache } from '../caching'
import sortBy from 'lodash/sortBy'
import { getGenericPipeline } from './generic_pipeline'
import { CompletionResult, computeCompletionByYear } from './completion'
import sum from 'lodash/sum'
import sumBy from 'lodash/sumBy'
import take from 'lodash/take'
import round from 'lodash/round'
import { count } from 'console'

export interface TermAggregationOptions {
    // filter aggregations
    filters?: Filters
    // sort?: string
    // order?: -1 | 1
    sort?: SortSpecifier
    facetSort?: SortSpecifier
    cutoff?: number
    limit?: number
    year?: number
    keys?: string[]
    facet?: Facet
    facetMinPercent?: number
    facetMinCount?: number
}

export interface SortSpecifier {
    property: string
    order: 'asc' | 'desc'
}

export interface ResultsByYear {
    year: number
    facets: FacetItem[]
    completion: YearCompletion
}

export interface FacetItem {
    mean?: number
    type: Facet
    id: number | string
    buckets: BucketItem[]
    entity?: Entity
    completion: FacetCompletion
}

export interface BucketItem {
    id: number | string
    count: number
    // percentage?: number
    // percentage_survey?: number

    // percentage relative to the number of question respondents
    percentage_question: number
    // percentage relative to the number of respondents in the facet
    percentage_facet: number
    // percentage relative to the number of respondents in the survey
    percentage_survey: number

    // count when no facet is selected
    count_all_facets: number
    // percentage relative to the number
    percentage_all_facets: number

    entity?: Entity
}

export interface RawResult {
    id: number | string
    entity?: Entity
    year: number
    count: number
}

export interface TermBucket {
    id: number | string
    entity?: any
    count: number
    countDelta?: number
    percentage: number
    percentage_survey?: number
    percentageDelta?: number
}

export interface YearAggregations {
    year: number
    total: number
    completion: YearCompletion
    buckets: TermBucket[]
}

export type AggregationFunction = (
    db: Db,
    survey: SurveyConfig,
    key: string,
    options: TermAggregationOptions
) => Promise<any>

export async function computeTermAggregationAllYears(
    db: Db,
    survey: SurveyConfig,
    key: string,
    options: TermAggregationOptions = {},
    aggregationFunction: AggregationFunction = computeDefaultTermAggregationByYear
) {
    return aggregationFunction(db, survey, key, options)
}

export async function computeDefaultTermAggregationByYear(
    db: Db,
    survey: SurveyConfig,
    key: string,
    options: TermAggregationOptions = {}
) {
    const collection = db.collection(config.mongo.normalized_collection)

    // use last segment of field as id
    const fieldId = key.split('.').reverse()[0]

    const {
        filters,
        // sort = 'count',
        // order = -1,
        cutoff = 10,
        limit = 50,
        year,
        facet,
        keys: values,
        facetMinPercent,
        facetMinCount
    }: TermAggregationOptions = options

    const convertOrder = (order: 'asc' | 'desc') => (order === 'asc' ? 1 : -1)

    const sort = options?.sort?.property ?? 'count'
    const order = convertOrder(options?.sort?.order ?? 'desc')

    const facetSort = options?.facetSort?.property ?? 'mean'
    const facetOrder = convertOrder(options?.facetSort?.order ?? 'desc')

    // console.log('// key')
    // console.log(key)
    // console.log('// options')
    // console.log(options)

    const match: any = {
        survey: survey.survey,
        [key]: { $nin: [null, '', []] },
        ...generateFiltersQuery(filters)
    }
    // if year is passed, restrict aggregation to specific year
    if (year) {
        match.year = year
    }

    // TODO: merge these counts into the main aggregation pipeline if possible
    const totalRespondentsByYear = await getParticipationByYearMap(db, survey)
    const completionByYear = await computeCompletionByYear(db, match)

    // console.log(match)

    const pipelineProps = {
        match,
        facet,
        fieldId,
        key,
        year,
        limit,
        filters,
        cutoff,
        survey: survey.survey
    }

    let results = (await collection
        .aggregate(getGenericPipeline(pipelineProps))
        .toArray()) as ResultsByYear[]

    // console.log(
    //     inspect(
    //         {
    //             match,
    //             sampleAggregationPipeline: getGenericPipeline(pipelineProps),
    //             results
    //         },
    //         { colors: true, depth: null }
    //     )
    // )

    await addEntities(results)

    await addCompletionCounts(results, totalRespondentsByYear, completionByYear)

    await applyCutoff(results, cutoff)

    await addPercentages(results)

    // await addDeltas(results)

    await sortBuckets(results, { sort, order, values })

    if (values) {
        await addMeans(results, values)
    }

    await sortFacets(results, { sort: facetSort, order: facetOrder })

    await limitFacets(results, limit, { facetMinPercent, facetMinCount })

    // console.log(JSON.stringify(results, undefined, 2))

    return results
}

export async function limitFacets(
    resultsByYears: ResultsByYear[],
    limit: number,
    { facetMinPercent, facetMinCount }: { facetMinPercent?: number; facetMinCount?: number }
) {
    if (limit) {
        for (let year of resultsByYears) {
            let facets = year.facets
            // if a minimum question percentage/count is specified, filter out
            // any facets that represent less than that
            if (facetMinPercent || facetMinCount) {
                facets = facets.filter(f => {
                    const abovePercent = facetMinPercent
                        ? f.completion.percentage_question > facetMinPercent
                        : true
                    const aboveCount = facetMinCount
                        ? f.completion.count > facetMinCount
                        : true
                    return abovePercent && aboveCount
                })
            }
            year.facets = take(facets, limit)
        }
    }
}

export async function addMeans(resultsByYears: ResultsByYear[], values: string[] | number[]) {
    for (let year of resultsByYears) {
        for (let facet of year.facets) {
            let totalValue = 0
            let totalCount = 0
            const coeffs = values.map((id, index) => ({ id, coeff: index + 1 }))
            facet.buckets.forEach((bucket, index) => {
                const { count, id } = bucket
                const coeff = coeffs.find(c => c.id === id)?.coeff ?? 1
                totalValue += count * coeff
                totalCount += count
            })
            facet.mean = round(totalValue / totalCount, 2)
        }
    }
}

// add entities to facet and bucket items if applicable
export async function addEntities(resultsByYears: ResultsByYear[]) {
    for (let year of resultsByYears) {
        for (let facet of year.facets) {
            const facetEntity = await getEntity(facet)
            if (facetEntity) {
                facet.entity = facetEntity
            }
            for (let bucket of facet.buckets) {
                const bucketEntity = await getEntity(bucket)
                if (bucketEntity) {
                    bucket.entity = bucketEntity
                }
            }
        }
    }
}

// add completion counts for each year and facet
export async function addCompletionCounts(
    resultsByYears: ResultsByYear[],
    totalRespondentsByYear: {
        [key: number]: number
    },
    completionByYear: Record<number, CompletionResult>
) {
    for (let yearObject of resultsByYears) {
        const totalRespondents = totalRespondentsByYear[yearObject.year] ?? 0
        const questionRespondents = completionByYear[yearObject.year]?.total ?? 0
        yearObject.completion = {
            total: totalRespondents,
            count: questionRespondents,
            percentage_survey: ratioToPercentage(questionRespondents / totalRespondents)
        }
        for (let facet of yearObject.facets) {
            const facetTotal = sumBy(facet.buckets, 'count')
            facet.completion = {
                total: totalRespondents,
                count: facetTotal,
                percentage_question: ratioToPercentage(facetTotal / questionRespondents),
                percentage_survey: ratioToPercentage(facetTotal / totalRespondents)
            }
        }
    }
}

// add completion counts for each year
export async function applyCutoff(resultsByYears: ResultsByYear[], cutoff: number = 1) {
    for (let year of resultsByYears) {
        for (let facet of year.facets) {
            facet.buckets = facet.buckets.filter(bucket => bucket.count >= cutoff)
        }
    }
}

// add percentages relative to question respondents and survey respondents
export async function addPercentages(resultsByYears: ResultsByYear[]) {
    for (let year of resultsByYears) {
        for (let facet of year.facets) {
            for (let bucket of facet.buckets) {
                bucket.percentage_survey = ratioToPercentage(bucket.count / year.completion.total)
                bucket.percentage_question = ratioToPercentage(bucket.count / year.completion.count)
                bucket.percentage_facet = ratioToPercentage(bucket.count / facet.completion.count)

                // const defaultFacetCount
                // const all
                const allCounts = year.facets.map(
                    (f: FacetItem) => f.buckets.find(b => b.id === bucket.id)?.count || 0
                )
                bucket.count_all_facets = sum(allCounts)
                bucket.percentage_all_facets = ratioToPercentage(
                    bucket.count_all_facets / year.completion.count
                )
            }
        }
    }
}

// TODO ? or else remove this
export async function addDeltas(resultsByYears: ResultsByYear[]) {
    // // compute deltas
    // resultsWithPercentages.forEach((year, i) => {
    //     const previousYear = resultsByYear[i - 1]
    //     if (previousYear) {
    //         year.buckets.forEach(bucket => {
    //             const previousYearBucket = previousYear.buckets.find(b => b.id === bucket.id)
    //             if (previousYearBucket) {
    //                 bucket.countDelta = bucket.count - previousYearBucket.count
    //                 bucket.percentageDelta =
    //                     Math.round(100 * (bucket.percentage - previousYearBucket.percentage)) / 100
    //             }
    //         })
    //     }
    // })
}

interface SortOptions {
    sort: string
    order: 1 | -1
    values?: string[] | number[]
}
export async function sortBuckets(resultsByYears: ResultsByYear[], options: SortOptions) {
    const { sort, order, values } = options
    for (let year of resultsByYears) {
        for (let facet of year.facets) {
            if (values) {
                // if values are specified, sort by values
                facet.buckets = [...facet.buckets].sort((a, b) => {
                    // make sure everything is a string to avoid type mismatches
                    const stringValues = values.map(v => v.toString())
                    return (
                        stringValues.indexOf(a.id.toString()) -
                        stringValues.indexOf(b.id.toString())
                    )
                })
            } else {
                // sort by sort/order
                facet.buckets = sortBy(facet.buckets, sort)
                if (order === -1) {
                    facet.buckets.reverse()
                }
            }
        }
    }
}

export async function sortFacets(resultsByYears: ResultsByYear[], options: SortOptions) {
    const { sort, order } = options
    for (let year of resultsByYears) {
        year.facets = sortBy(year.facets, sort)
        if (order === -1) {
            year.facets.reverse()
        }
    }
}

export async function computeTermAggregationAllYearsWithCache(
    db: Db,
    survey: SurveyConfig,
    id: string,
    options: TermAggregationOptions = {},
    aggregationFunction?: AggregationFunction
) {
    return useCache(computeTermAggregationAllYears, db, [survey, id, options, aggregationFunction])
}

export async function computeTermAggregationSingleYear(
    db: Db,
    survey: SurveyConfig,
    key: string,
    options: TermAggregationOptions,
    aggregationFunction?: AggregationFunction
) {
    const allYears = await computeTermAggregationAllYears(
        db,
        survey,
        key,
        options,
        aggregationFunction
    )
    return allYears[0]
}

export async function computeTermAggregationSingleYearWithCache(
    db: Db,
    survey: SurveyConfig,
    id: string,
    options: TermAggregationOptions,
    aggregationFunction?: AggregationFunction
) {
    return useCache(computeTermAggregationSingleYear, db, [
        survey,
        id,
        options,
        aggregationFunction
    ])
}
