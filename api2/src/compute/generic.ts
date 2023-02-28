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
    EditionDataLegacy,
    ComputeAxisParameters
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

const convertOrder = (order: 'asc' | 'desc') => (order === 'asc' ? 1 : -1)

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
    let axis1: ComputeAxisParameters,
        axis2: ComputeAxisParameters | null = null
    const { db, isDebug } = context
    const collection = db.collection(config.mongo.normalized_collection)

    const { dbPath } = question

    const {
        filters,
        cutoff = 1,
        cutoffPercent,
        limit = 50,
        selectedEditionId,
        facet,
        facetLimit,
        facetCutoff,
        facetCutoffPercent
    } = parameters

    const options = question.options && question.options.map(o => o.id)

    /*

    Axis 1

    */
    axis1 = {
        question,
        sort: parameters?.sort?.property ?? 'count',
        order: convertOrder(parameters?.sort?.order ?? 'desc'),
        cutoff,
        limit
    }
    if (options) {
        axis1.options = options
    }

    /*

    Axis 2

    
    */
    if (facet) {
        let [sectionId, facetId] = facet?.split('__')
        const facetQuestion = questionObjects.find(
            q => q.id === facetId && q.surveyId === survey.id
        )
        if (facetQuestion) {
            axis2 = {
                question: facetQuestion,
                sort: parameters?.facetSort?.property ?? 'mean',
                order: convertOrder(parameters?.facetSort?.order ?? 'desc'),
                cutoff: facetCutoff,
                cutoffPercent: facetCutoffPercent,
                limit: facetLimit
            }
            const facetOptions = facetQuestion?.options?.map(o => o.id)
            if (facetOptions) {
                axis2.options = facetOptions
            }
            // switch both axes in order to get a better result object structure
            const temp = axis1
            axis1 = axis2
            axis2 = temp
        }
    }

    console.log('// parameters')
    console.log(parameters)
    console.log('// axis1')
    console.log(axis1)
    console.log('// axis2')
    console.log(axis2)

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
    if (selectedEditionId) {
        match.surveySlug = selectedEditionId
    }

    // TODO: merge these counts into the main aggregation pipeline if possible
    const totalRespondentsByYear = await getParticipationByYearMap(context, survey)
    const completionByYear = await computeCompletionByYear(context, match)

    // console.log(match)

    const pipelineProps = {
        surveyId: survey.id,
        selectedEditionId,
        filters,
        axis1,
        axis2
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

    // await discardEmptyIds(results)

    if (axis1.options) {
        // await addMissingBucketValues(results, axis1.options)
    }

    // await addEntities(results)

    // await addCompletionCounts(results, totalRespondentsByYear, completionByYear)

    if (!axis1.options) {
        // do not apply cutoff for aggregations that have predefined values,
        // as that might result in unexpectedly missing buckets
        // await applyCutoff(results, cutoff)
    }
    // await addPercentages(results)

    //// await addDeltas(results)

    // await sortBuckets(results, axis1)

    if (!axis1.options) {
        // do not apply limits for aggregations that have predefined values,
        // as that might result in unexpectedly missing buckets
        // await limitBuckets(results, limit)
    }

    if (axis1.options) {
        // await addMeans(results, axis1.options)
    }

    if (axis2) {
        // await sortFacets(results, axis2)
        // await limitFacets(results, axis2)
    }

    if (!facet) {
        // if no facet is specified, move default buckets down one level
        results = results.map(editionData => {
            const { facets, ...rest } = editionData
            return { ...rest, buckets: results[0].facets[0].buckets }
        })
    }
    console.log('// results')
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
