import { inspect } from 'util'
import config from '../config'
import { SurveyConfig, RequestContext } from '../types'
import { generateFiltersQuery } from '../filters'
import { getParticipationByYearMap } from './demographics'
import { getGenericPipeline } from './generic_pipeline'
import { computeCompletionByYear } from './completion'
import { getChartKeys } from '../helpers'
import isEmpty from 'lodash/isEmpty.js'
import { getFacetSegments } from '../helpers'
import { Edition, Section, QuestionObject } from '../generate/types'

import { TermAggregationOptions, ResultsByYear } from './types'

import {
    discardEmptyIds,
    addMissingBucketValues,
    addEntities,
    addCompletionCounts,
    applyCutoff,
    addPercentages,
    sortBuckets,
    limitBuckets,
    addMeans,
    sortFacets,
    limitFacets
} from './stages'

export async function genericComputeFunction({
    context,
    survey,
    edition,
    section,
    question,
    options = {}
}: {
    context: RequestContext
    survey: SurveyConfig
    edition: Edition
    section: Section
    question: QuestionObject
    options: TermAggregationOptions
}) {
    const { db, isDebug } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const { dbPath } = question

    const {
        filters,
        // sort = 'count',
        // order = -1,
        cutoff = 1,
        limit = 50,
        year,
        facet,
        facetLimit,
        facetMinPercent,
        facetMinCount
    }: TermAggregationOptions = options

    // if values (keys) are not passed as options, look in globally defined yaml keys
    const values = question.options && question.options.map(o => o.id)

    const hasValues = values && !isEmpty(values)

    const convertOrder = (order: 'asc' | 'desc') => (order === 'asc' ? 1 : -1)

    const sort = options?.sort?.property ?? 'count'
    const order = convertOrder(options?.sort?.order ?? 'desc')

    const { fieldName: facetId } = (options.facet && getFacetSegments(options.facet)) || {}
    const facetSort = options?.facetSort?.property ?? 'mean'
    const facetOrder = convertOrder(options?.facetSort?.order ?? 'desc')
    const facetValues = options.facet2keys || (facetId && getChartKeys(facetId))

    console.log('// dbPath')
    console.log(dbPath)
    console.log('// options')
    console.log(options)
    console.log('// values')
    console.log(values)
    console.log('// facetValues')
    console.log(facetValues)

    const match: any = {
        survey: survey.id,
        [dbPath]: { $nin: [null, '', [], {}] },
        ...generateFiltersQuery({ filters, dbPath })
    }
    // if year is passed, restrict aggregation to specific year
    if (year) {
        match.year = year
    }

    // TODO: merge these counts into the main aggregation pipeline if possible
    const totalRespondentsByYear = await getParticipationByYearMap(context, survey)
    const completionByYear = await computeCompletionByYear(context, match)

    // console.log(match)

    const pipelineProps = {
        match,
        facet,
        questionId: question.id,
        dbPath,
        year,
        limit,
        filters,
        cutoff,
        survey: survey.id
    }

    const pipeline = getGenericPipeline(pipelineProps)

    let results = (await collection.aggregate(pipeline).toArray()) as ResultsByYear[]

    if (isDebug) {
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

    await discardEmptyIds(results)

    if (hasValues) {
        await addMissingBucketValues(results, values)
    }

    await addEntities(results)

    await addCompletionCounts(results, totalRespondentsByYear, completionByYear)

    if (!hasValues) {
        // do not apply cutoff for aggregations that have predefined values,
        // as that might result in unexpectedly missing buckets
        await applyCutoff(results, cutoff)
    }
    await addPercentages(results)

    // await addDeltas(results)

    await sortBuckets(results, { sort, order, values })

    if (!hasValues) {
        // do not apply limits for aggregations that have predefined values,
        // as that might result in unexpectedly missing buckets
        await limitBuckets(results, limit)
    }

    if (hasValues) {
        await addMeans(results, values)
    }

    await sortFacets(results, { sort: facetSort, order: facetOrder, values: facetValues })

    await limitFacets(results, { facetLimit, facetMinPercent, facetMinCount })

    // console.log(JSON.stringify(results, undefined, 2))

    return results
}

// export async function computeTermAggregationAllYears(funcOptions: {
//     context: RequestContext
//     survey: SurveyConfig
//     key: string
//     options: TermAggregationOptions
//     aggregationFunction?: AggregationFunction
// }) {
//     const { aggregationFunction = computeDefaultTermAggregationByYear, ...options } = funcOptions
//     return aggregationFunction(options)
// }

// export async function computeTermAggregationAllYearsWithCache({
//     context,
//     survey,
//     key,
//     options = {},
//     aggregationFunction
// }: {
//     context: RequestContext
//     survey: SurveyConfig
//     key: string
//     options: TermAggregationOptions
//     aggregationFunction?: AggregationFunction
// }) {
//     return useCache({
//         func: computeTermAggregationAllYears,
//         context,
//         funcOptions: {
//             survey,
//             key,
//             options,
//             aggregationFunction
//         }
//     })
// }

// export async function computeTermAggregationSingleYear({
//     context,
//     survey,
//     key,
//     options,
//     aggregationFunction
// }: {
//     context: RequestContext
//     survey: SurveyConfig
//     key: string
//     options: TermAggregationOptions
//     aggregationFunction?: AggregationFunction
// }) {
//     const allYears = await computeTermAggregationAllYears({
//         context,
//         survey,
//         key,
//         options,
//         aggregationFunction
//     })
//     return allYears[0]
// }

// export async function computeTermAggregationSingleYearWithCache({
//     context,
//     survey,
//     key,
//     options,
//     aggregationFunction
// }: {
//     context: RequestContext
//     survey: SurveyConfig
//     key: string
//     options: TermAggregationOptions
//     aggregationFunction?: AggregationFunction
// }) {
//     return useCache({
//         func: computeTermAggregationSingleYear,
//         context,
//         funcOptions: {
//             survey,
//             key,
//             options,
//             aggregationFunction
//         }
//     })
// }
