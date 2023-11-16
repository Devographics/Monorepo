import { inspect } from 'util'
import config from '../config'
import { generateFiltersQuery } from '../filters'
import { computeParticipationByYear } from './demographics'
import { getGenericPipeline } from './generic_pipeline'
import { computeCompletionByYear } from './completion'
import {
    RequestContext,
    GenericComputeArguments,
    Survey,
    Edition,
    Section,
    QuestionApiObject,
    ResponseEditionData,
    ComputeAxisParameters,
    EditionApiObject,
    SortSpecifier,
    SortOrder,
    SortOrderNumeric
} from '../types'
import {
    discardEmptyIds,
    addDefaultBucketCounts,
    moveFacetBucketsToDefaultBuckets,
    addMissingBuckets,
    addEntities,
    addCompletionCounts,
    addPercentages,
    sortData,
    limitData,
    cutoffData,
    addEditionYears,
    discardEmptyEditions,
    addLabels,
    addAveragesByFacet,
    removeEmptyEditions,
    addPercentilesByFacet,
    groupBuckets,
    applyDatasetCutoff,
    combineWithFreeform,
    groupOtherBuckets,
    addOverallBucket
} from './stages/index'
import {
    ResponsesTypes,
    DbSuffixes,
    SurveyMetadata,
    EditionMetadata,
    ResponsesParameters,
    Filters,
    ResultsSubFieldEnum,
    SortProperty
} from '@devographics/types'
import { getCollection } from '../helpers/db'
import { getPastEditions } from '../helpers/surveys'
import { computeKey } from '../helpers/caching'
import isEmpty from 'lodash/isEmpty.js'
import { logToFile } from '@devographics/debug'

export const convertOrder = (order: SortOrder): SortOrderNumeric => (order === 'asc' ? 1 : -1)

export const convertOrderReverse = (order: SortOrderNumeric): SortOrder =>
    order === 1 ? 'asc' : 'desc'

/*

TODO:

- Actually differentiate between "freeform" and "prenormalized"
- Add ability to specify more than one response type in the same result list to generate
    global rankings of all responses

*/
export const getDbPath = (
    question: QuestionApiObject,
    responsesType: ResponsesTypes = ResponsesTypes.RESPONSES
) => {
    const { normPaths } = question
    if (responsesType === ResponsesTypes.RESPONSES) {
        return normPaths?.response
    } else if (responsesType === ResponsesTypes.COMBINED) {
        return normPaths?.response
    } else if (responsesType === ResponsesTypes.PRENORMALIZED) {
        return normPaths?.prenormalized
    } else {
        return normPaths?.other
    }
}

const getQuestionSort = ({
    specifier: specifier_,
    question,
    enableBucketGroups
}: {
    specifier?: SortSpecifier
    question: QuestionApiObject
    enableBucketGroups?: boolean
}) => {
    let defaultSort: SortProperty,
        defaultOrder: SortOrder = 'desc'
    if (enableBucketGroups && question.groups) {
        // if we're grouping, use group order
        defaultSort = 'options'
    } else if (question.defaultSort) {
        // if question has a default sort, use it
        defaultSort = question.defaultSort
    } else if (question.optionsAreNumeric) {
        if (question.options) {
            defaultSort = 'options'
        } else {
            // values are numeric but no options are specified, in this case
            // sort by id to get a nice curve of successive number
            defaultSort = 'id'
            defaultOrder = 'asc'
        }
    } else {
        // default to sorting by bucket count
        defaultSort = 'count'
    }
    const specifier = {
        sort: defaultSort,
        order: defaultOrder
    }
    // if sort/order have been explicitly passed, use that instead
    if (specifier_?.property) {
        specifier.sort = specifier_?.property
    }
    if (specifier_?.order) {
        specifier.order = specifier_?.order
    }
    // console.log('=====')
    // console.log({ ...specifier, order: convertOrder(specifier.order) })
    return { ...specifier, order: convertOrder(specifier.order) }
}

export const getGenericCacheKey = ({
    edition,
    question,
    subField = ResultsSubFieldEnum.RESPONSES,
    selectedEditionId,
    parameters,
    filters,
    facet
}: {
    edition: EditionApiObject
    question: QuestionApiObject
    subField: ResultsSubFieldEnum
    selectedEditionId: string
    parameters?: ResponsesParameters
    filters?: Filters
    facet?: string
}) => {
    const cacheKeyOptions: any = {
        editionId: selectedEditionId || `allEditions(${edition.id})`,
        questionId: question.id,
        subField
    }
    if (!isEmpty(parameters)) {
        const { enableCache, ...cacheKeyParameters } = parameters
        if (!isEmpty(cacheKeyParameters)) {
            cacheKeyOptions.parameters = { parameters: cacheKeyParameters }
        }
    }
    if (!isEmpty(filters)) {
        cacheKeyOptions.filters = { filters }
    }
    if (!isEmpty(facet)) {
        cacheKeyOptions.facet = { facet }
    }
    return computeKey('generic', cacheKeyOptions)
}

export type GenericComputeOptions = {
    context: RequestContext
    survey: SurveyMetadata
    edition: EditionMetadata
    section: Section // not used
    question: QuestionApiObject
    questionObjects: QuestionApiObject[]
    computeArguments: GenericComputeArguments
}

const DEFAULT_LIMIT = 50

export async function genericComputeFunction(options: GenericComputeOptions) {
    const { context, survey, edition, question, questionObjects, computeArguments } = options

    let axis1: ComputeAxisParameters,
        axis2: ComputeAxisParameters | null = null
    const { db, isDebug } = context
    const collection = getCollection(db, survey)

    // TODO "responsesType" is now called "subField" elsewhere, change it here as well at some point
    const { responsesType, filters, parameters = {}, facet, selectedEditionId } = computeArguments
    const {
        cutoff = 1,
        sort,
        limit = DEFAULT_LIMIT,
        facetSort,
        facetLimit = DEFAULT_LIMIT,
        facetCutoff = 1,
        showNoAnswer,
        groupUnderCutoff = true,
        mergeOtherBuckets = true,
        enableBucketGroups = true,
        enableAddOverallBucket = true,
        enableAddMissingBuckets
    } = parameters

    /*

    Axis 1

    */
    axis1 = {
        question,
        ...getQuestionSort({ specifier: sort, question, enableBucketGroups }),
        cutoff,
        groupUnderCutoff,
        mergeOtherBuckets,
        enableBucketGroups,
        enableAddMissingBuckets,
        limit
    }
    if (question.options) {
        axis1.options = question.options
    }

    /*

    Axis 2

    
    */
    if (facet) {
        let [sectionId, mainFieldId, subPathId] = facet?.split('__')
        const facetId = subPathId ? `${mainFieldId}__${subPathId}` : mainFieldId
        const facetQuestion = questionObjects.find(
            q => q.id === facetId && q.surveyId === survey.id
        )
        if (facetQuestion) {
            axis2 = {
                question: facetQuestion,
                ...getQuestionSort({
                    specifier: facetSort,
                    question: facetQuestion,
                    enableBucketGroups
                }),
                cutoff: facetCutoff,
                groupUnderCutoff,
                mergeOtherBuckets,
                enableBucketGroups,
                enableAddMissingBuckets,
                limit: facetLimit
            }
            if (facetQuestion?.options) {
                axis2.options = facetQuestion?.options
            }
            // switch both axes in order to get a better result object structure
            const temp = axis1
            axis1 = axis2
            axis2 = temp
        }
    }

    const dbPath = getDbPath(question, responsesType)

    if (!dbPath) {
        throw new Error(
            `No dbPath found for question id ${question.id} with subfield ${responsesType}`
        )
    }

    let match: any = {
        surveyId: survey.id,
        [dbPath]: { $nin: [null, '', [], {}] }
    }
    if (filters) {
        const filtersQuery = await generateFiltersQuery({ filters, dbPath })
        match = { ...match, ...filtersQuery }
    }
    if (selectedEditionId) {
        // if edition is passed, restrict aggregation to specific edition
        match.editionId = selectedEditionId
    } else {
        // restrict aggregation to current and past editions, to avoid including results from the future
        const pastEditions = getPastEditions({ survey, edition })
        match.editionId = { $in: pastEditions.map(e => e.id) }
    }

    // TODO: merge these counts into the main aggregation pipeline if possible
    const totalRespondentsByYear = await computeParticipationByYear({ context, survey })
    const completionByYear = await computeCompletionByYear({ context, match, survey })

    const pipelineProps = {
        surveyId: survey.id,
        selectedEditionId,
        filters,
        axis1,
        axis2,
        responsesType,
        showNoAnswer,
        survey,
        edition
    }

    const pipeline = await getGenericPipeline(pipelineProps)

    let results = (await collection.aggregate(pipeline).toArray()) as ResponseEditionData[]

    if (isDebug) {
        console.log(
            `// Using collection ${survey.normalizedCollectionName} on db ${process.env.MONGO_PUBLIC_DB}`
        )
        // console.log(
        //     inspect(
        //         {
        //             match,
        //             pipeline
        //         },
        //         { colors: true, depth: null }
        //     )
        // )
        // console.log('// raw results')
        // console.log(JSON.stringify(results, null, 2))

        await logToFile('last_query/computeArguments.json', computeArguments)
        await logToFile('last_query/axis1.json', axis1)
        await logToFile('last_query/axis2.json', axis2)
        await logToFile('last_query/match.json', match)
        await logToFile('last_query/pipeline.json', pipeline)
        await logToFile('last_query/rawResults.yml', results)
    }

    if (!axis2) {
        // TODO: get rid of this by rewriting the mongo aggregation
        // if no facet is specified, move default buckets down one level
        await moveFacetBucketsToDefaultBuckets(results)
    }

    if (responsesType === ResponsesTypes.COMBINED) {
        results = await combineWithFreeform(results, options)
    }

    await discardEmptyIds(results)

    results = await discardEmptyEditions(results)

    await addEntities(results, context)

    if (axis2) {
        await addDefaultBucketCounts(results)

        await addMissingBuckets(results, axis2, axis1)

        await addCompletionCounts(results, totalRespondentsByYear, completionByYear)

        // bucket grouping must be one of the first stages
        await groupBuckets(results, axis2, axis1)

        // we group cutoff buckets together so it must also come early
        await cutoffData(results, axis2, axis1)

        // optionally add overall, non-facetted bucket as a point of comparison
        if (enableAddOverallBucket) {
            await addOverallBucket(results, axis1, options)
        }

        results = await applyDatasetCutoff(results, computeArguments)

        if (
            responsesType === ResponsesTypes.COMBINED ||
            responsesType === ResponsesTypes.FREEFORM
        ) {
            // TODO: probably doesn't work well when a facet is active
            await groupOtherBuckets(results, axis2, axis1)
        }

        // once buckets don't move anymore we can calculate percentages
        await addPercentages(results)

        // await addDeltas(results)

        await addEditionYears(results, survey)

        await addAveragesByFacet(results, axis2, axis1)
        await addPercentilesByFacet(results, axis2, axis1)

        // for all following steps, use groups as options
        if (axis1.enableBucketGroups && axis1.question.groups) {
            axis1.options = axis1.question.groups
        }
        if (axis2.enableBucketGroups && axis2.question.groups) {
            axis2.options = axis2.question.groups
        }
        await sortData(results, axis2, axis1)
        await limitData(results, axis2, axis1)
        await addLabels(results, axis2, axis1)
    } else {
        results = await addMissingBuckets(results, axis1)

        await addCompletionCounts(results, totalRespondentsByYear, completionByYear)

        await groupBuckets(results, axis1)

        await cutoffData(results, axis1)

        results = await applyDatasetCutoff(results, computeArguments)

        if (
            responsesType === ResponsesTypes.COMBINED ||
            responsesType === ResponsesTypes.FREEFORM
        ) {
            await groupOtherBuckets(results, axis1)
        }

        await addPercentages(results)

        // await addDeltas(results)

        await addEditionYears(results, survey)

        // for all following steps, use groups as options
        if (axis1.enableBucketGroups && axis1.question.groups) {
            axis1.options = axis1.question.groups
        }
        await sortData(results, axis1)
        await limitData(results, axis1)
        await addLabels(results, axis1)
    }

    if (isDebug) {
        // console.log('// results final')
        // console.log(JSON.stringify(results, undefined, 2))
        await logToFile('last_query/results.yml', results)
    }

    return results
}
