import { QuestionApiObject, ResolverType } from '../types/surveys'
import { getFiltersTypeName, getFacetsTypeName, graphqlize } from '../generate/helpers'
import { Option, ResultsSubFieldEnum } from '@devographics/types'
import { getEntities, getEntity } from '../load/entities'

interface SubField {
    id: ResultsSubFieldEnum
    def: (question: QuestionApiObject) => string
    addIf: (question: QuestionApiObject) => boolean
    addIfAsync?: (question: QuestionApiObject) => Promise<boolean>
    resolverFunction?: ResolverType
}

const getResponsesTypeDef = ({ surveyId }: QuestionApiObject, subField: ResultsSubFieldEnum) =>
    `${subField}(filters: ${getFiltersTypeName(
        surveyId
    )}, parameters: Parameters, facet: ${getFacetsTypeName(surveyId)}): ${graphqlize(
        surveyId
    )}Responses`

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
            return question
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
        id: ResultsSubFieldEnum.FREEFORM,
        def: question => getResponsesTypeDef(question, ResultsSubFieldEnum.FREEFORM),
        addIf: ({ normPaths }) => !!normPaths?.other,
        resolverFunction: responsesResolverFunction
    },
    {
        id: ResultsSubFieldEnum.COMMENTS,
        def: () => 'comments: ItemComments',
        addIf: ({ normPaths }) => !!normPaths?.comment,
        resolverFunction: parent => {
            // empty pass-through resolver
            console.log('// comments resolver')
            return parent
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
