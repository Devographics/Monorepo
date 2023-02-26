import { inspect } from 'util'
import config from '../config'
import { RequestContext } from '../types'
import { generateFiltersQuery } from '../filters'
import { getParticipationByYearMap } from './demographics'
import { getGenericPipeline } from './generic_pipeline'
import { computeCompletionByYear } from './completion'
import { getChartKeys } from '../helpers'
import isEmpty from 'lodash/isEmpty.js'
import { getFacetSegments } from '../helpers'
import { Survey, Edition, Section, ParsedQuestion, YearData } from '../generate/types'

import { TermAggregationOptions } from './types'

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
    parameters = {}
}: {
    context: RequestContext
    survey: Survey
    edition: Edition
    section: Section
    question: ParsedQuestion
    parameters: TermAggregationOptions
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
    }: TermAggregationOptions = parameters

    const options = question.options && question.options.map(o => o.id)

    const hasValues = options && !isEmpty(options)

    const convertOrder = (order: 'asc' | 'desc') => (order === 'asc' ? 1 : -1)

    const sort = parameters?.sort?.property ?? 'count'
    const order = convertOrder(parameters?.sort?.order ?? 'desc')

    const { fieldName: facetId } = (parameters.facet && getFacetSegments(parameters.facet)) || {}
    const facetSort = parameters?.facetSort?.property ?? 'mean'
    const facetOrder = convertOrder(parameters?.facetSort?.order ?? 'desc')
    const facetOptions = parameters.facet2keys || (facetId && getChartKeys(facetId))

    console.log('// outline path')
    console.log(survey.id, edition.id, section.id, question.id)
    console.log(question)
    console.log('// dbPath')
    console.log(dbPath)
    console.log('// parameters')
    console.log(parameters)
    console.log('// options')
    console.log(options)
    console.log('// facetOptions')
    console.log(facetOptions)

    let match: any = {
        survey: survey.id,
        [dbPath]: { $nin: [null, '', [], {}] }
    }
    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath })
        match = { ...match, ...filtersQuery }
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

    const pipeline = await getGenericPipeline(pipelineProps)

    let results = (await collection.aggregate(pipeline).toArray()) as YearData[]

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
        await addMissingBucketValues(results, options)
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

    await sortBuckets(results, { sort, order, options })

    if (!hasValues) {
        // do not apply limits for aggregations that have predefined values,
        // as that might result in unexpectedly missing buckets
        await limitBuckets(results, limit)
    }

    if (hasValues) {
        await addMeans(results, options)
    }

    await sortFacets(results, { sort: facetSort, order: facetOrder, options: facetOptions })

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
