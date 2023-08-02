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
    SortProperty
} from '../types'
import {
    discardEmptyIds,
    addDefaultBucketCounts,
    moveFacetBucketsToDefaultBuckets,
    addMissingItems,
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
    addPercentiles
} from './stages/index'
import { ResponsesTypes, DbSuffixes, SurveyMetadata, EditionMetadata } from '@devographics/types'
import { getCollection } from '../helpers/db'
import { getPastEditions } from '../helpers/surveys'

const convertOrder = (order: 'asc' | 'desc') => (order === 'asc' ? 1 : -1)

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
    } else {
        return normPaths?.other
    }
}

export async function genericComputeFunction({
    context,
    survey,
    edition,
    section,
    question,
    questionObjects,
    computeArguments
}: {
    context: RequestContext
    survey: SurveyMetadata
    edition: EditionMetadata
    section: Section
    question: QuestionApiObject
    questionObjects: QuestionApiObject[]
    computeArguments: GenericComputeArguments
}) {
    let axis1: ComputeAxisParameters,
        axis2: ComputeAxisParameters | null = null
    const { db, isDebug } = context
    const collection = getCollection(db, survey)

    const { normPaths } = question

    // TODO "responsesType" is now called "subField" elsewhere, change it here as well at some point
    const { responsesType, filters, parameters = {}, facet, selectedEditionId } = computeArguments
    const {
        cutoff = 1,
        cutoffPercent,
        sort,
        limit = 50,
        facetSort,
        facetLimit = 50,
        facetCutoff = 1,
        facetCutoffPercent,
        showNoAnswer
    } = parameters

    /*

    Axis 1

    */
    axis1 = {
        question,
        sort: sort?.property ?? (question.defaultSort as SortProperty) ?? 'count',
        order: convertOrder(sort?.order ?? 'desc'),
        cutoff,
        limit
    }
    if (question.options) {
        axis1.options = question.options
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
                sort: facetSort?.property ?? (facetQuestion.defaultSort as SortProperty) ?? 'count',
                order: convertOrder(facetSort?.order ?? 'desc'),
                cutoff: facetCutoff,
                cutoffPercent: facetCutoffPercent,
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

    console.log('// computeArguments')
    console.log(computeArguments)
    console.log('// axis1')
    console.log(axis1)
    console.log('// axis2')
    console.log(axis2)

    const dbPath = getDbPath(question, responsesType)

    if (!dbPath) {
        throw new Error(`No dbPath found for question id ${question.id}`)
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
        console.log(`// Using collection ${survey.dbCollectionName}`)
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

    if (!axis2) {
        // TODO: get rid of this by rewriting the mongo aggregation
        // if no facet is specified, move default buckets down one level
        await moveFacetBucketsToDefaultBuckets(results)
    }

    await discardEmptyIds(results)

    results = await discardEmptyEditions(results)

    await addEntities(results, context)

    if (axis2) {
        await addDefaultBucketCounts(results)
    }

    await addCompletionCounts(results, totalRespondentsByYear, completionByYear)

    await addPercentages(results)

    // await addDeltas(results)

    await addEditionYears(results, survey)

    if (axis2) {
        if (responsesType === ResponsesTypes.RESPONSES) {
            await addMissingItems(results, axis2, axis1)
        }
        await addAveragesByFacet(results, axis2, axis1)
        await addPercentiles(results, axis2, axis1)
        await sortData(results, axis2, axis1)
        await limitData(results, axis2, axis1)
        await cutoffData(results, axis2, axis1)
        await addLabels(results, axis2, axis1)
    } else {
        if (responsesType === ResponsesTypes.RESPONSES) {
            await addMissingItems(results, axis1)
        }
        await sortData(results, axis1)
        await limitData(results, axis1)
        await cutoffData(results, axis1)
        await addLabels(results, axis1)
    }

    console.log('// results final')
    console.log(JSON.stringify(results, undefined, 2))

    return results
}
