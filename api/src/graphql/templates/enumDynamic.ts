import { ResponsesTypes, ResultsStatusEnum, ResultsSubFieldEnum } from '@devographics/types'
import {
    ExecutionContext,
    QuestionApiObject,
    RequestContext,
    TypeDefTemplateOutput,
    TypeTypeEnum
} from '../../types'
import { genericComputeFunction, getGenericCacheKey } from '../../compute'
import { specialBucketIds } from '../../compute/stages'
import { useCache } from '../../helpers/caching'

/*

How many items will be made available in the enum

*/
const OPTIONS_LIMIT = 10

/*

Sample output:

enum StateOfAiModelsOthersID {
    write_in_model_1
    write_in_model_2
    user_submitted_model3
    foo_gpt
    ...
}

*/

export const generateDynamicEnumType = async ({
    question,
    context,
    questionObjects
}: {
    question: QuestionApiObject
    context: RequestContext
    questionObjects: QuestionApiObject[]
}): Promise<TypeDefTemplateOutput | undefined> => {
    const { survey, editions } = question

    /*

    Note: in theory each survey edition should have its own enum since the same question
    in different surveys can have different top answers. But to keep things simpler
    we only consider the most recent edition. 

    */
    const selectedEditionId = editions?.at(-1)!
    const edition = survey.editions.find(e => e.id === selectedEditionId)!

    const { enumTypeName, groups, optionsAreNumeric } = question
    const parameters = { limit: OPTIONS_LIMIT, showNoAnswer: false }
    const computeArguments = {
        executionContext: ExecutionContext.REGULAR,
        responsesType: ResponsesTypes.FREEFORM,
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

    const result = await useCache({
        key: getGenericCacheKey(cacheKeyOptions),
        func: genericComputeFunction,
        context,
        funcOptions,
        enableCache: true,
        enableLog: false
    })
    // const result = await genericComputeFunction(funcOptions)

    const options = result[0]?.buckets
        .filter(b => !specialBucketIds.includes(b.id))
        .map(b => ({ id: b.id }))

    if (!options || options.length === 0) {
        // if question does not have any response data associated for whatever reason
        console.log('// no options found')
        console.log(question.id)
        return
    }

    return {
        generatedBy: `enumDynamic/[${question.editions?.join(',')}]/${question.id}`,
        typeName: enumTypeName,
        typeType: TypeTypeEnum.ENUM,
        typeDef: `enum ${enumTypeName} {
    ${options.map(o => o.id).join('\n    ')}
}`
    }
}
