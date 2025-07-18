import { generateFiltersQuery } from '../filters'
import { computeParticipationByYear } from './demographics'
import { getGenericPipeline } from './generic_pipeline'
import { computeCompletionByYear } from './completion'
import {
    RequestContext,
    GenericComputeArguments,
    QuestionApiObject,
    ComputeAxisParameters,
    EditionApiObject,
    SortSpecifier,
    SortOrder,
    SortOrderNumeric,
    ExecutionContext,
    DbMatch,
    MatchNin,
    SurveyApiObject
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
    addAverages,
    addPercentiles,
    groupBuckets,
    applyDatasetCutoff,
    combineWithFreeform,
    groupOtherBuckets,
    addOverallBucket,
    addTokens,
    getData,
    addFacetValiditySums,
    addRatios,
    detectNaN,
    addMetadata,
    restrictBuckets
} from './stages'
import {
    ResponsesTypes,
    SurveyMetadata,
    EditionMetadata,
    ResponsesParameters,
    Filters,
    ResultsSubFieldEnum,
    SortProperty,
    Survey,
    StandardQuestionData,
    ResponseEditionData
} from '@devographics/types'
import { getPastNEditions } from '../helpers/surveys'
import { computeKey } from '../helpers/caching'
import isEmpty from 'lodash/isEmpty.js'
import { logToFile } from '@devographics/debug'
import { SENTIMENT_FACET } from '@devographics/constants'
import { addValues } from './stages/add_values'

type StageLogItem = {
    name: string
    startAt: Date
    endAt: Date
    duration: number
    bucketCount: number
}

export const ninObject: MatchNin = { $nin: [null, '', [], {}] }

export const convertOrder = (order: SortOrder): SortOrderNumeric => (order === 'asc' ? 1 : -1)

export const convertOrderReverse = (order: SortOrderNumeric): SortOrder =>
    order === 1 ? 'asc' : 'desc'

/*

Always use freeform/other field for source field

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

    if (question.id === 'source') {
        return normPaths?.other
    } else {
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
    } else if (question.optionsAreSequential) {
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
    editionCount,
    parameters,
    filters,
    facet,
    prefix = 'generic'
}: {
    edition: EditionApiObject
    question: QuestionApiObject
    subField: ResultsSubFieldEnum
    selectedEditionId: string
    editionCount: number
    parameters?: ResponsesParameters
    filters?: Filters
    facet?: string
    prefix?: string
}) => {
    const cacheKeyOptions: any = {
        editionId: selectedEditionId || `allEditions(${edition.id})`,
        questionId: question.id,
        editionCount,
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
    return computeKey(prefix, cacheKeyOptions)
}

export type GenericComputeOptions = {
    context: RequestContext
    survey: SurveyApiObject
    edition: EditionApiObject
    question: QuestionApiObject
    questionObjects: QuestionApiObject[]
    computeArguments: GenericComputeArguments
}

const DEFAULT_LIMIT = 50

export const getMatch = async ({
    survey,
    edition,
    dbPath,
    filters,
    questionObjects,
    selectedEditionId,
    editionCount,
    testForNull = true
}: {
    survey: SurveyApiObject
    edition: EditionApiObject
    dbPath: string
    filters?: Filters
    questionObjects: QuestionApiObject[]
    selectedEditionId?: string
    editionCount?: number
    testForNull?: boolean
}) => {
    const surveyId = survey.id
    let match = {
        surveyId
    }
    if (testForNull) {
        match[dbPath] = ninObject
    }
    if (filters) {
        const filtersQuery = generateFiltersQuery({ filters, surveyId, questionObjects })
        match = { ...match, ...filtersQuery }
    }
    if (selectedEditionId) {
        // if edition is passed, restrict aggregation to specific edition
        match.editionId = selectedEditionId
    } else {
        // restrict aggregation to current and past editions, to avoid including results from the future
        // when regenerating older surveys
        const pastEditions = getPastNEditions({ survey, edition, editionCount })
        match.editionId = { $in: pastEditions.map(e => e.id) }
    }
    return match
}

export async function genericComputeFunction(
    options: GenericComputeOptions
): Promise<ResponseEditionData[]> {
    const startAt = new Date()
    const stageLog: StageLogItem[] = []

    const runStage = async (f: (...args: any[]) => Promise<any>, args: any) => {
        const startAt = new Date()
        const result = await f.apply(null, args)
        const bucketCount = result?.[0]?.buckets?.length
        const endAt = new Date()
        const duration = Math.abs(endAt.getTime() - startAt.getTime())
        const logItem = { name: f.name, startAt, endAt, duration, bucketCount }
        stageLog.push(logItem)
        return result
    }

    const { context, survey, edition, question, questionObjects, computeArguments } = options

    let axis1: ComputeAxisParameters,
        axis2: ComputeAxisParameters | null = null
    const { db, isDebug } = context

    // TODO "responsesType" is now called "subField" elsewhere, change it here as well at some point
    const {
        responsesType,
        filters,
        parameters = {},
        bucketsFilter,
        facet,
        selectedEditionId,
        editionCount,
        executionContext = ExecutionContext.REGULAR
    } = computeArguments
    const {
        cutoff = 1,
        cutoffPercent,
        sort,
        limit = DEFAULT_LIMIT,
        facetSort,
        facetLimit = DEFAULT_LIMIT,
        facetCutoff = 1,
        facetCutoffPercent,
        showNoAnswer,
        mergeOtherBuckets = true,
        enableBucketGroups = true,
        enableAddOverallBucket = true,
        enableAddMissingBuckets
    } = parameters

    const logPath = `last_query/${executionContext}`

    if (isDebug) {
        console.log(`//--- start genericComputeFunction (executionContext = ${executionContext})`)
    }

    // these are not passed as parameters anymore, but just default to being always true
    // if the extra groups are not needed they can just be ignored by the user
    const groupUnderCutoff = true
    const groupOverLimit = true

    /*

    Axis 1

    */
    const sortSpecifier = getQuestionSort({ specifier: sort, question, enableBucketGroups })
    axis1 = {
        question,
        ...sortSpecifier,
        cutoff,
        cutoffPercent,
        groupUnderCutoff,
        groupOverLimit,
        mergeOtherBuckets,
        enableBucketGroups,
        enableAddMissingBuckets,
        bucketsFilter,
        limit
    }
    if (question.options) {
        axis1.options = question.options
    }

    /*

    Axis 2

    
    */
    let axis2SortSpecifier
    if (facet) {
        if (facet === SENTIMENT_FACET) {
            /*

            Hack: when dealing with questions that supports sentiment, 
            override axis2 and use sentiment in its place

            */
            const sentimentAxis = {
                sort: axis1.sort,
                order: axis1.order,
                cutoff: axis1.cutoff,
                limit: axis1.limit,
                question: {
                    surveyId: axis1.question.surveyId,
                    template: axis1.question.template,
                    id: `${axis1.question.id}__sentiment`,
                    normPaths: {
                        response: `${axis1.question?.normPaths?.base}.sentiment`
                    }
                }
            }
            // do the switch axes around thing
            axis2 = axis1
            axis1 = sentimentAxis
        } else {
            let [sectionId, mainFieldId, subPathId] = facet?.split('__')
            const facetId = subPathId ? `${mainFieldId}__${subPathId}` : mainFieldId
            const facetQuestion = questionObjects.find(
                q => q.id === facetId && q.surveyId === survey.id
            )
            if (facetQuestion) {
                axis2SortSpecifier = getQuestionSort({
                    specifier: facetSort,
                    question: facetQuestion,
                    enableBucketGroups
                })
                axis2 = {
                    question: facetQuestion,
                    ...axis2SortSpecifier,
                    cutoff: facetCutoff,
                    cutoffPercent: facetCutoffPercent,
                    groupUnderCutoff,
                    groupOverLimit,
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
    }

    const dbPath = getDbPath(question, responsesType)

    if (!dbPath) {
        throw new Error(
            `No dbPath found for question id ${question.id} with subfield ${responsesType}`
        )
    }

    const matchOptions = {
        survey,
        edition,
        editionCount,
        selectedEditionId,
        dbPath,
        filters,
        questionObjects
    }
    const match = await getMatch(matchOptions)

    if (isDebug) {
        await logToFile(`${logPath}/computeArguments.json`, computeArguments)
        await logToFile(`${logPath}/axis1.json`, axis1)
        await logToFile(`${logPath}/axis2.json`, axis2)
        await logToFile(`${logPath}/match.json`, match)
    }

    // TODO: merge these counts into the main aggregation pipeline if possible
    const totalRespondentsByYear = await runStage(computeParticipationByYear, [
        { context, survey, logPath, isDebug }
    ])
    const completionByYear = await runStage(computeCompletionByYear, [
        { context, matchOptions, survey, dbPath, logPath, isDebug }
    ])

    const pipelineProps = {
        surveyId: survey.id,
        selectedEditionId,
        editionCount,
        filters,
        axis1,
        axis2,
        responsesType,
        showNoAnswer,
        survey,
        edition,
        questionObjects
    }

    const pipeline = await runStage(getGenericPipeline, [pipelineProps])

    let results = await runStage(getData, [db, survey, pipeline])

    if (isDebug) {
        // console.log(
        //     `// Using collection ${
        //         survey.normalizedCollectionName || 'normalized_responses'
        //     } on db ${process.env.MONGO_PUBLIC_DB}`
        // )
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

        await logToFile(`${logPath}/pipeline.json`, pipeline)
        await logToFile(`${logPath}/rawResults.yml`, results)
        const normalizedCollectionName = survey?.normalizedCollectionName || 'normalized_responses'
        await logToFile(`${logPath}/database.yml`, { db: db.namespace, normalizedCollectionName })
    }

    if (!axis2) {
        // TODO: get rid of this by rewriting the mongo aggregation
        // if no facet is specified, move default buckets down one level
        await runStage(moveFacetBucketsToDefaultBuckets, [results])
    }

    /*

    Combine with freeform if

    1. this is still the regular execution context
    2. we're querying the combined subfield
    3. there are freeform responses
    4. the predefined and freeform responses have different dbPaths
    
    */
    const responseDbPath = getDbPath(question, ResponsesTypes.RESPONSES)
    const freeformDbPath = getDbPath(question, ResponsesTypes.FREEFORM)
    if (
        executionContext === ExecutionContext.REGULAR &&
        responsesType === ResponsesTypes.COMBINED &&
        freeformDbPath &&
        responseDbPath != freeformDbPath
    ) {
        results = await runStage(combineWithFreeform, [results, options])
    }

    await runStage(discardEmptyIds, [results])

    results = await runStage(discardEmptyEditions, [results])

    if (axis2) {
        await runStage(addDefaultBucketCounts, [results])

        await runStage(addMissingBuckets, [results, axis2, axis1])

        await runStage(addCompletionCounts, [results, totalRespondentsByYear, completionByYear])

        // optionally add overall, non-facetted bucket as a point of comparison
        // note: for now, disable this for sentiment questions to avoid infinite loops
        if (enableAddOverallBucket && facet !== SENTIMENT_FACET) {
            await runStage(addOverallBucket, [results, axis1, options])
        }

        // once buckets don't move anymore we can calculate percentages
        await runStage(addPercentages, [results])

        // await addDeltas(results)

        await runStage(addEditionYears, [results, survey])

        await runStage(addAverages, [results, axis2, axis1])
        await runStage(addPercentiles, [results, axis2, axis1])

        if (executionContext === ExecutionContext.REGULAR) {
            // bucket grouping
            await runStage(groupBuckets, [results, axis2, axis1])

            // cutoff data
            await runStage(cutoffData, [results, axis2, axis1])

            // apply overall dataset cutoff
            await runStage(applyDatasetCutoff, [results, computeArguments, axis2, axis1])

            // for all following steps, use groups as options
            if (axis1.enableBucketGroups && axis1.question.groups) {
                axis1.options = axis1.question.groups
            }
            if (axis2.enableBucketGroups && axis2.question.groups) {
                axis2.options = axis2.question.groups
            }

            await runStage(addEntities, [results, context, axis2])
            await runStage(addTokens, [results, context, axis2])
            await runStage(addValues, [results, context, axis2, axis1])

            // restrict buckets to the ones specified in bucketsFilter if needed
            // note: this uses entity tags so do it after addEntities
            await runStage(restrictBuckets, [results, axis2])

            await runStage(sortData, [results, axis2, axis1])

            await runStage(limitData, [results, axis2, axis1])

            // group any "non-standard" bucket, including cutoff data, unmatched answers,
            // off-limit answers, etc.
            await runStage(groupOtherBuckets, [results, axis2, axis1])

            if (facet === SENTIMENT_FACET) {
                // only enable ratios when we're using sentiment facet
                await runStage(addRatios, [results, axis1, axis2])
            }
        }

        // run this after we've grouped buckets to detect any errors introduced during
        // that process
        await runStage(addFacetValiditySums, [results])

        await runStage(addLabels, [results, axis2, axis1])
        await runStage(addMetadata, [results, axis2, axis1])
    } else {
        results = await runStage(addMissingBuckets, [results, axis1])

        await runStage(addCompletionCounts, [results, totalRespondentsByYear, completionByYear])

        await runStage(addPercentages, [results])

        await runStage(addEditionYears, [results, survey])

        await runStage(addAverages, [results, axis1])
        await runStage(addPercentiles, [results, axis1])

        if (executionContext === ExecutionContext.REGULAR) {
            await runStage(groupBuckets, [results, axis1])

            await runStage(cutoffData, [results, axis1])

            await runStage(applyDatasetCutoff, [results, computeArguments, axis1])

            // for all following steps, use groups as options
            if (axis1.enableBucketGroups && axis1.question.groups) {
                axis1.options = axis1.question.groups
            }

            await runStage(addEntities, [results, context, axis1])
            await runStage(addTokens, [results, context, axis1])
            await runStage(addValues, [results, context, axis1])

            // restrict buckets to the ones specified in bucketsFilter if needed
            // note: this uses entity tags so do it after addEntities
            await runStage(restrictBuckets, [results, axis1])

            await runStage(sortData, [results, axis1])
            await runStage(limitData, [results, axis1])

            // group any "non-standard" bucket, including cutoff data, unmatched answers,
            // off-limit answers, etc.
            await runStage(groupOtherBuckets, [results, axis1])
        }
        await runStage(addLabels, [results, axis1])
        await runStage(addMetadata, [results, axis1])
    }

    await runStage(detectNaN, [results, isDebug, logPath])

    const endAt = new Date()
    if (isDebug) {
        // console.log('// results final')
        // console.log(JSON.stringify(results, undefined, 2))
        await logToFile(`${logPath}/results.yml`, results)
        const log = {
            startAt,
            endAt,
            duration: Math.abs((startAt.getTime() - endAt.getTime()) / 1000),
            log: stageLog.map(({ name, duration, bucketCount }) => ({
                name,
                duration,
                bucketCount
            }))
        }
        await logToFile(`${logPath}/stages.yml`, log)
    }

    if (isDebug) {
        console.log(`end genericComputeFunction (executionContext = ${executionContext}) ---//`)
    }

    return results
}
