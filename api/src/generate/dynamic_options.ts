import { Option, ResponsesTypes, ResultsSubFieldEnum } from '@devographics/types'
import { getGenericCacheKey, genericComputeFunction } from '../compute'
import { specialBucketIds } from '../compute/stages'
import { useCache } from '../helpers/caching'
import { QuestionApiObject, RequestContext, ExecutionContext } from '../types'
import { disallowFields } from './helpers'
import sortBy from 'lodash/sortBy.js'
import take from 'lodash/take.js'
import uniqBy from 'lodash/uniqBy.js'
import takeRight from 'lodash/takeRight.js'

/*

How many items will be made available in the enum

*/
export const OPTIONS_LIMIT = 20

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

    const parameters = { limit: OPTIONS_LIMIT, showNoAnswer: false, enableBucketGroups: false }
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
        const useCacheOptions = {
            key: cacheKey,
            func: genericComputeFunction,
            context,
            funcOptions,
            enableCache,
            enableLog: true
        }
        const result = await useCache(useCacheOptions)

        // look at past two editions to generate dynamic options
        const pastTwoEditionsBuckets = takeRight(result, 2)
            .map(result => result.buckets)
            .flat()
        // get rid of duplicates
        const uniqueBuckets = uniqBy(pastTwoEditionsBuckets, bucket => bucket.id)
        // sort by count, descending
        const bucketsSorted = sortBy(uniqueBuckets, bucket => bucket.count).toReversed()
        // keep top 20 items
        const bucketsLimited = take(bucketsSorted, OPTIONS_LIMIT)

        const options = bucketsLimited
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
