import { inspect } from 'util'
import config from '../config'
import { generateFiltersQuery } from '../filters'
import { getParticipationByYearMap } from './demographics'
import { getGenericPipeline } from './generic_pipeline'
import { computeCompletionByYear } from './completion'
import { getChartKeys } from '../helpers'
import isEmpty from 'lodash/isEmpty.js'
import { getFacetSegments } from '../helpers'
import {
    RequestContext,
    GenericComputeParameters,
    Survey,
    Edition,
    Section,
    ParsedQuestion,
    EditionDataLegacy
} from '../types'

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
    questionObjects,
    parameters = {}
}: {
    context: RequestContext
    survey: Survey
    edition: Edition
    section: Section
    question: ParsedQuestion
    questionObjects: ParsedQuestion[]
    parameters: GenericComputeParameters
}) {
    let facetQuestion, facetOptions
    const { db, isDebug } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const { dbPath } = question

    const {
        filters,
        cutoff = 1,
        limit = 50,
        editionId,
        facet,
        facetLimit,
        facetMinPercent,
        facetMinCount
    } = parameters

    const options = question.options && question.options.map(o => o.id)

    const hasValues = options && !isEmpty(options)

    const convertOrder = (order: 'asc' | 'desc') => (order === 'asc' ? 1 : -1)

    const sort = parameters?.sort?.property ?? 'count'
    const order = convertOrder(parameters?.sort?.order ?? 'desc')

    const facetSort = parameters?.facetSort?.property ?? 'mean'
    const facetOrder = convertOrder(parameters?.facetSort?.order ?? 'desc')

    console.log('// outline path')
    console.log(survey.id, edition.id, section.id, question.id)
    console.log('// dbPath')
    console.log(dbPath)
    console.log('// parameters')
    console.log(parameters)
    console.log('// options')
    console.log(options)

    if (facet) {
        let [sectionId, facetId] = facet?.split('__')
        facetQuestion = questionObjects.find(q => q.id === facetId && q.surveyId === survey.id)
        facetOptions = facetQuestion?.options?.map(o => o.id)
        console.log('// facetQuestion')
        console.log(facetQuestion)
        console.log('// facetOptions')
        console.log(facetOptions)
    }

    if (!dbPath) {
        throw new Error(`No dbPath found for question id ${question.id}`)
    }

    let match: any = {
        survey: survey.id,
        [dbPath]: { $nin: [null, '', [], {}] }
    }
    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath })
        match = { ...match, ...filtersQuery }
    }
    // if edition is passed, restrict aggregation to specific edition
    if (editionId) {
        match.surveySlug = editionId
    }

    // TODO: merge these counts into the main aggregation pipeline if possible
    const totalRespondentsByYear = await getParticipationByYearMap(context, survey)
    const completionByYear = await computeCompletionByYear(context, match)

    // console.log(match)

    const pipelineProps = {
        match,
        facetQuestion,
        questionId: question.id,
        dbPath,
        editionId,
        limit,
        filters,
        cutoff,
        survey: survey.id
    }

    const pipeline = await getGenericPipeline(pipelineProps)

    let results = (await collection.aggregate(pipeline).toArray()) as EditionDataLegacy[]

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

    if (!facet) {
        // if no facet is specified, move default buckets down one level
        results = results.map(editionData => {
            const { facets, ...rest } = editionData
            console.log('// editionData')
            console.log(editionData)
            return { ...rest, buckets: results[0].facets[0].buckets }
        })
    }
    console.log(JSON.stringify(results, undefined, 2))

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
