import { QuestionApiObject, ResolverType } from '../types/surveys'
import { getFiltersTypeName, getFacetsTypeName, graphqlize } from '../generate/helpers'
import { Option, ResultsSubFieldEnum } from '@devographics/types'
import { getEntities, getEntity } from '../load/entities'
import { getResponseTypeName } from '../graphql/templates'

interface SubField {
    id: ResultsSubFieldEnum
    def: (question: QuestionApiObject) => string
    addIf: (question: QuestionApiObject) => boolean
    addIfAsync?: (question: QuestionApiObject) => Promise<boolean>
    resolverFunction?: ResolverType
}

export const getResponsesTypeDef = (
    question: QuestionApiObject,
    subField: ResultsSubFieldEnum | string
) =>
    `${subField}(${
        question.filterTypeName ? `bucketsFilter: ${question.filterTypeName},` : ''
    } filters: ${getFiltersTypeName(
        question.surveyId
    )}, parameters: Parameters, facet: ${getFacetsTypeName(
        question.surveyId
    )}): ${getResponseTypeName()}`

const responsesResolverFunction: ResolverType = async (parent, args, context, info) => {
    console.log('// responses resolver')
    return { ...parent, responseArguments: args }
}

export const subFields: Array<SubField> = [
    {
        id: ResultsSubFieldEnum.ID,
        def: () => `id: String`,
        addIf: () => true,
        resolverFunction: ({ question }) => {
            console.log('// question id resolver')
            return question.id
        }
    },
    {
        id: ResultsSubFieldEnum.METADATA,
        def: () => `_metadata: QuestionMetadata`,
        addIf: () => true,
        resolverFunction: ({ question }) => {
            console.log('// question metadata resolver')
            // note: providing the question's original sectionId is useful for filtering
            const sectionId = question?.section?.id
            return { ...question, sectionId }
        }
    },
    {
        id: ResultsSubFieldEnum.RESPONSES,
        def: question => getResponsesTypeDef(question, ResultsSubFieldEnum.RESPONSES),
        addIf: ({ normPaths }) => !!normPaths?.response,
        resolverFunction: responsesResolverFunction
    },
    {
        id: ResultsSubFieldEnum.PRENORMALIZED,
        def: question => getResponsesTypeDef(question, ResultsSubFieldEnum.PRENORMALIZED),
        addIf: ({ normPaths }) => !!normPaths?.prenormalized,
        resolverFunction: responsesResolverFunction
    },
    {
        id: ResultsSubFieldEnum.COMBINED,
        def: question => getResponsesTypeDef(question, ResultsSubFieldEnum.COMBINED),
        addIf: ({ normPaths }) => !!normPaths?.other && !!normPaths?.response,
        resolverFunction: responsesResolverFunction
    },
    {
        id: ResultsSubFieldEnum.FREEFORM,
        def: question => getResponsesTypeDef(question, ResultsSubFieldEnum.FREEFORM),
        addIf: ({ normPaths }) => !!normPaths?.other,
        resolverFunction: responsesResolverFunction
    },
    {
        id: ResultsSubFieldEnum.COMMENTS,
        def: () => 'comments: ItemComments',
        addIf: ({ normPaths }) => !!normPaths?.comment,
        resolverFunction: (parent, args) => {
            // empty pass-through resolver
            console.log('// comments resolver')
            return { ...parent, args }
        }
    },
    {
        id: ResultsSubFieldEnum.OPTIONS,
        def: ({ optionTypeName }) => `options: [${optionTypeName}]`,
        addIf: ({ optionTypeName, options }) => !!(optionTypeName && options),
        resolverFunction: async ({ question }, args, context) => {
            console.log('// question options resolver')
            const questionOptions = question.options as Option[]

            const optionEntities = await getEntities({
                ids: questionOptions.map(o => o.id),
                context
            })

            return questionOptions.map(option => ({
                ...option,
                entity: optionEntities.find(o => o.id === option.id)
            }))
        }
    },
    {
        id: ResultsSubFieldEnum.ENTITY,
        def: () => `entity: Entity`,
        addIf: () => false, // will be overridden by addIfAsync
        addIfAsync: async ({ id }) => !!(await getEntity({ id })),
        resolverFunction: async ({ question }, args, context) => {
            console.log('// question entity resolver')
            return await getEntity({ id: question.id, context })
        }
    }
]
