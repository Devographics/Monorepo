import { QuestionApiObject, ResolverType } from '../types/surveys'
import { getFiltersTypeName, getFacetsTypeName, graphqlize } from '../generate/helpers'
import { Option, ResultsSubFieldEnum, subfieldDocs } from '@devographics/types'
import { getEntities, getEntity } from '../load/entities'
import { getResponseTypeName } from '../graphql/templates'
import intersection from 'lodash/intersection.js'

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
) => {
    const docs = subfieldDocs[subField as ResultsSubFieldEnum]
    const docsBlock = docs
        ? `"""
    ${docs}
    """`
        : ''

    return `${docsBlock}
${subField}(bucketsFilter: ${
        question.filterTypeName || 'GenericFilter'
    }, filters: ${getFiltersTypeName(
        question.surveyId
    )}, parameters: Parameters, facet: ${getFacetsTypeName(
        question.surveyId
    )}): ${getResponseTypeName()}`
}

const responsesResolverFunction: ResolverType = async (parent, args, context, info) => {
    console.log('// responses resolver')
    return { ...parent, responseArguments: args }
}

export const subFields: Array<SubField> = [
    {
        id: ResultsSubFieldEnum.ID,
        def: () => `${ResultsSubFieldEnum.ID}: String`,
        addIf: () => true,
        resolverFunction: ({ question }) => {
            console.log('// question id resolver')
            return question.id
        }
    },
    {
        id: ResultsSubFieldEnum.METADATA,
        def: () => `${ResultsSubFieldEnum.METADATA}: QuestionMetadata`,
        addIf: () => true,
        resolverFunction: ({ question }) => {
            console.log('// question metadata resolver')
            // note: providing the question's original sectionId is useful for filtering
            const sectionId = question?.section?.id
            return { ...question, sectionId }
        }
    },
    {
        id: ResultsSubFieldEnum.RELEVANT_ENTITIES,
        def: () => `${ResultsSubFieldEnum.RELEVANT_ENTITIES}: [Entity]`,
        addIf: ({ normPaths }) => !!normPaths?.other,
        resolverFunction: async ({ question }) => {
            console.log('// question relevant entities resolver')
            const matchTags = question?.matchTags
            const allEntities = await getEntities({ includeNormalizationEntities: true })
            const _entities = allEntities.filter(e => intersection(e.tags, matchTags).length > 0)
            return _entities
        }
    },
    {
        id: ResultsSubFieldEnum.RELEVANT_ENTITIES_COUNT,
        def: () => `${ResultsSubFieldEnum.RELEVANT_ENTITIES_COUNT}: Int`,
        addIf: ({ normPaths }) => !!normPaths?.other,
        resolverFunction: async ({ question }) => {
            console.log('// question relevant entities count resolver')
            const matchTags = question?.matchTags
            const allEntities = await getEntities({ includeNormalizationEntities: true })
            const _entities = allEntities.filter(e => intersection(e.tags, matchTags).length > 0)
            return _entities.length
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
        // addIf: ({ normPaths }) => !!normPaths?.other && !!normPaths?.response,
        // always add combined to simplify things
        addIf: ({ normPaths }) => !!normPaths?.other || !!normPaths?.response,
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
        def: () => `${ResultsSubFieldEnum.COMMENTS}: ItemComments`,
        addIf: ({ normPaths }) => !!normPaths?.comment,
        resolverFunction: (parent, args) => {
            // empty pass-through resolver
            console.log('// comments resolver')
            return { ...parent, args }
        }
    },
    {
        id: ResultsSubFieldEnum.OPTIONS,
        def: ({ optionTypeName }) => `${ResultsSubFieldEnum.OPTIONS}: [${optionTypeName}]`,
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
        def: () => `${ResultsSubFieldEnum.ENTITY}: Entity`,
        addIf: () => false, // will be overridden by addIfAsync
        addIfAsync: async ({ id }) => !!(await getEntity({ id })),
        resolverFunction: async ({ question }, args, context) => {
            console.log('// question entity resolver')
            return await getEntity({ id: question.id, context })
        }
    }
]

export const getSubfield = (id: ResultsSubFieldEnum) => {
    const subfield = subFields.find(s => s.id === id)
    if (!subfield) {
        throw Error(`getSubfield error: no subfield with id ${id}`)
    }
    return subfield
}
