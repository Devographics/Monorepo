import { Option, ResponsesTypes, ResultsSubFieldEnum } from '@devographics/types'
import { getGenericCacheKey, genericComputeFunction } from '../compute'
import { specialBucketIds } from '../compute/stages'
import { useCache } from '../helpers/caching'
import { QuestionApiObject, RequestContext, ExecutionContext } from '../types'
import { disallowFields, OPTIONS_LIMIT } from './helpers'

export const getDynamicOptions = async ({
    question,
    context,
    questionObjects
}: {
    question: QuestionApiObject
    context: RequestContext
    questionObjects: QuestionApiObject[]
}): Promise<Option[] | undefined> => {
    const { survey, editions, normPaths = {} } = question

    if (disallowFields.includes(question.id)) {
        return
    }
    /*

    Note: in theory each survey edition should have its own enum since the same question
    in different surveys can have different top answers. But to keep things simpler
    we only consider the most recent edition.

    */
    const selectedEditionId = editions?.at(-1)!
    const edition = survey.editions.find(e => e.id === selectedEditionId)!

    // figure out which field to look in to generate dynamic options
    // in no particular order for now
    let subfield
    if (normPaths.prenormalized) {
        subfield = ResponsesTypes.PRENORMALIZED
    } else if (normPaths.other) {
        subfield = ResponsesTypes.FREEFORM
    } else if (normPaths.response) {
        subfield = ResponsesTypes.RESPONSES
    } else {
        // no valid paths found
        // console.log(
        //     `// no normPaths found for ${edition.id}/${question.id}, can't generate dynamic options`
        // )
        return
    }

    const parameters = { limit: OPTIONS_LIMIT, showNoAnswer: false }
    const computeArguments = {
        executionContext: ExecutionContext.REGULAR,
        responsesType: subfield,
        // bucketsFilter,
        parameters
        // filters,
        // facet,
        // selectedEditionId,
        // editionCount
    }
    const funcOptions = {
        survey,
        edition,
        selectedEditionId,
        question,
        context: { ...context, isDebug: true },
        questionObjects,
        computeArguments
    }

    const cacheKeyOptions = {
        edition,
        question,
        subField: ResultsSubFieldEnum.COMBINED,
        selectedEditionId,
        editionCount: 1,
        parameters,
        prefix: 'enumDynamic'
    }

    const enableCache = true
    const cacheKey = getGenericCacheKey(cacheKeyOptions)
    try {
        const result = await useCache({
            key: cacheKey,
            func: genericComputeFunction,
            context,
            funcOptions,
            enableCache,
            enableLog: false
        })
        // const result = await genericComputeFunction(funcOptions)
        const options = result[0]?.buckets
            .filter(b => !specialBucketIds.includes(b.id))
            .map(b => ({ id: b.id }))

        if (!options || options.length === 0) {
            // if question does not have any response data associated for whatever reason
            // console.log('// no options found')
            // console.log(question.id)
            return
        }

        return options
    } catch (error) {
        console.log(`// getDynamicOptions error for question ${question.id}`)
        console.log(error)
        return
    }
}
