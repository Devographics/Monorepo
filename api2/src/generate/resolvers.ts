import {
    SurveyApiObject,
    EditionApiObject,
    Survey,
    Edition,
    Section,
    Question,
    QuestionApiObject,
    Option,
    TypeObject,
    ResolverType,
    ResolverMap,
    ResolverParent,
    QuestionResolverParent
} from '../types/surveys'
import { getPath, formatNumericOptions } from './helpers'
import { genericComputeFunction } from '../compute'
import { useCache, computeKey } from '../helpers/caching'
import { getRawCommentsWithCache } from '../compute/comments'
import { getEntity, getEntities } from '../load/entities'
import omit from 'lodash/omit.js'
import { entityResolverMap } from '../resolvers/entities'
import { getResponseTypeName } from '../graphql/templates/responses'
import { RequestContext, SectionApiObject } from '../types'

export const generateResolvers = async ({
    surveys,
    questionObjects,
    typeObjects
}: {
    surveys: SurveyApiObject[]
    questionObjects: QuestionApiObject[]
    typeObjects: TypeObject[]
}) => {
    // generate resolver map for root survey fields (i.e. each survey)
    const surveysFieldsResolvers = Object.fromEntries(
        surveys.map(survey => {
            return [
                survey.id,
                getSurveyResolver({
                    survey
                })
            ]
        })
    )

    const resolvers = {
        Query: { _metadata: getGlobalMetadataResolver({ surveys }), surveys: () => surveys },
        Surveys: surveysFieldsResolvers,
        ItemComments: commentsResolverMap,
        CreditItem: creditResolverMap,
        Entity: entityResolverMap,
        EditionMetadata: editionMetadataResolverMap,
        SectionMetadata: sectionMetadataResolverMap,
        QuestionMetadata: questionMetadataResolverMap
    } as any

    for (const survey of surveys) {
        resolvers[getResponseTypeName(survey.id)] = responsesResolverMap

        // generate resolver map for each survey field (i.e. each survey edition)
        const surveyFieldsResolvers = Object.fromEntries(
            survey.editions.map(edition => {
                return [
                    edition.id,
                    getEditionResolver({
                        survey,
                        edition
                    })
                ]
            })
        )
        const surveyTypeObject = typeObjects.find(t => t.path === getPath({ survey }))
        if (surveyTypeObject) {
            resolvers[surveyTypeObject.typeName] = {
                _metadata: getSurveyMetadataResolver({ survey }),
                ...surveyFieldsResolvers
            }
        }

        for (const edition of survey.editions) {
            if (edition.sections.length > 0) {
                // generate resolver map for each edition field (i.e. each edition section)
                const editionTypeObject = typeObjects.find(
                    t => t.path === getPath({ survey, edition })
                )
                if (editionTypeObject) {
                    const editionFieldsResolvers = Object.fromEntries(
                        edition.sections.map((section: Section) => {
                            return [
                                section.id,
                                getSectionResolver({
                                    survey,
                                    edition,
                                    section
                                })
                            ]
                        }) || []
                    )

                    resolvers[editionTypeObject.typeName] = {
                        _metadata: getEditionMetadataResolver({ survey, edition }),
                        ...(edition.sections ? editionFieldsResolvers : {})
                    }
                }

                for (const section of edition.sections) {
                    // generate resolvers for each section
                    const sectionTypeObject = typeObjects.find(
                        t => t.path === getPath({ survey, edition, section })
                    )

                    if (sectionTypeObject) {
                        // generate resolver map for each section field (i.e. each section question)
                        resolvers[sectionTypeObject.typeName] = Object.fromEntries(
                            section.questions.map((questionObject: QuestionApiObject) => {
                                return [
                                    questionObject.id,
                                    getQuestionResolver({
                                        survey,
                                        edition,
                                        section,
                                        question: questionObject,
                                        questionObjects
                                    })
                                ]
                            })
                        )
                    }

                    for (const questionObject of section.questions) {
                        if (questionObject.fieldTypeName) {
                            resolvers[questionObject.fieldTypeName] =
                                questionObject.resolverMap || {
                                    responses: responsesResolverFunction
                                }
                        }
                    }
                }
            }
        }
    }
    // console.log(resolvers)
    return resolvers
}

const getGlobalMetadataResolver =
    ({ surveys }: { surveys: SurveyApiObject[] }): ResolverType =>
    (parent, args) => {
        console.log('// getGlobalMetadataResolver')
        const { surveyId, editionId } = args
        let filteredSurveys = surveys
        if (editionId) {
            filteredSurveys = filteredSurveys
                .map(s => ({
                    ...s,
                    editions: s.editions.filter(e => e.id === editionId)
                }))
                .filter(s => s.editions.length > 0)
        } else if (surveyId) {
            filteredSurveys = surveys.filter(s => s.id === surveyId)
        }
        return { surveys: filteredSurveys }
    }

const getSurveyResolver =
    ({ survey }: { survey: SurveyApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// survey resolver')
        return survey
    }

const getSurveyMetadataResolver =
    ({ survey }: { survey: SurveyApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// survey metadata resolver')
        return survey
    }

const getEditionResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// edition resolver')
        return edition
    }

const getEditionMetadataResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log('// edition metadata resolver')
        const sections = edition.sections.map(section => ({
            ...section,
            questions: section.questions
                .filter(question => question?.editions?.includes(edition.id))
                .map(q => ({ ...q, editionId: edition.id }))
        }))
        return { ...edition, surveyId: survey.id, survey, sections }
    }

const getSectionResolver =
    ({
        survey,
        edition,
        section
    }: {
        survey: Survey
        edition: Edition
        section: Section
    }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// section resolver')
        return section
    }

const getQuestionResolver =
    ({ survey, edition, section, question, questionObjects }: ResolverParent): ResolverType =>
    async (parent, args, context, info) => {
        console.log('// question resolver')

        const result: QuestionResolverParent = {
            survey,
            edition,
            section,
            question,
            questionObjects
        }
        if (question.options) {
            const questionOptions: Option[] = question.optionsAreNumeric
                ? formatNumericOptions(question.options)
                : question.options

            const optionEntities = await getEntities({
                ids: questionOptions.map(o => o.id),
                context
            })

            result.options = questionOptions.map(option => ({
                ...option,
                entity: optionEntities.find(o => o.id === option.id)
            }))
        }
        return result
    }

/*

Responses 

*/

export const responsesResolverFunction: ResolverType = async (parent, args, context, info) => {
    console.log('// responses resolver')
    return { ...parent, responseArguments: args }
}

export const allEditionsResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// allEditionsResolver')
    const { survey, edition, section, question, responseArguments, questionObjects } = parent
    const { parameters = {}, filters, facet, responsesType } = responseArguments || {}
    const { enableCache, ...cacheKeyParameters } = parameters

    const { selectedEditionId } = args
    const computeArguments = { responsesType, parameters, filters, facet, selectedEditionId }

    const funcOptions = {
        survey,
        edition,
        section,
        question,
        context,
        questionObjects,
        computeArguments
    }

    let result = await useCache({
        key: computeKey(genericComputeFunction, {
            surveyId: survey.id,
            editionId: edition.id,
            sectionId: section.id,
            questionId: question.id,
            parameters: cacheKeyParameters,
            filters,
            facet,
            selectedEditionId
        }),
        func: genericComputeFunction,
        context,
        funcOptions,
        enableCache
    })

    if (question.transformFunction) {
        result = question.transformFunction(parent, result, context)
    }
    return result
}

export const currentEditionResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// currentEditionResolver')
    const result = await allEditionsResolver(
        parent,
        { selectedEditionId: parent.edition.id },
        context,
        info
    )
    return result[0]
}

export const responsesResolverMap: ResolverMap = {
    allEditions: allEditionsResolver,
    currentEdition: currentEditionResolver
}

/*

Comments

*/
// empty pass-through resolver
export const commentsResolverFunction: ResolverType = parent => {
    console.log('// comments resolver')
    return parent
}
export const commentsResolverMap: ResolverMap = {
    allEditions: async ({ survey, question }, {}, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            context
        }),
    currentEdition: async ({ survey, edition, question }, {}, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            editionId: edition.id,
            context
        })
}

/*

Credit

*/
export const creditResolverMap = {
    entity: async ({ id }: { id: string }, {}, context: RequestContext) =>
        await getEntity({ id, context })
}

/*

Edition Metadata (remove "virtual" apiOnly sections from metadata)

*/
export const editionMetadataResolverMap = {
    sections: async (parent: EditionApiObject, {}, context: RequestContext) => {
        const { sections } = parent
        return sections.filter(s => s.questions.some(q => q.apiOnly !== true))
    }
}

/*

Section Metadata (remove "virtual" apiOnly questions from metadata)

*/
export const sectionMetadataResolverMap = {
    questions: async (parent: SectionApiObject, {}, context: RequestContext) => {
        const { questions } = parent
        return questions.filter(q => q.apiOnly !== true)
    }
}

/*

Questions Metadata (decorate with entities)

*/
export const questionMetadataResolverMap = {
    // intlId: async (parent: QuestionApiObject, {}, context: RequestContext) => {
    //     const { id, intlId, section } = parent
    //     console.log('// intlId')
    //     console.log(parent)
    //     // if intlId is explicitely specified on question object use that
    //     if (intlId) {
    //         return intlId
    //     }
    //     const sectionSegment = section!.id
    //     const questionSegment = id
    //     return [sectionSegment, questionSegment].join('.')
    // },

    entity: async (parent: QuestionApiObject, {}, context: RequestContext) => {
        const { id } = parent
        return await getEntity({ id, context })
    },

    options: async (parent: QuestionApiObject, {}, context: RequestContext) => {
        const { template, options, editionId } = parent

        const optionEntities = await getEntities({
            ids: options?.map(o => o.id),
            context
        })
        const optionsWithEntities = options
            ?.filter(option => option.editions?.includes(editionId!))
            .map(option => ({
                ...omit(option, 'editions'),
                entity: optionEntities.find(o => o.id === option.id)
            }))
        // avoid repeating the options for feature and tool questions
        // since there's so many of them
        // NOTE: disabled since it does saves a few kb, but at the cost of a lot of downstream complexity
        // return ['feature', 'tool'].includes(template) ? [] : optionsWithEntities
        return optionsWithEntities
    }
}

/*

Other Resolvers

*/
export const entityResolverFunction: ResolverType = ({ question }, args, context) =>
    getEntity({ id: question.id, context })

export const idResolverFunction: ResolverType = ({ question }) => question.id

/*

Resolver map used for all_features, all_tools, section_features, section_tools

*/
export const getToolsFeaturesResolverMap = ({
    survey,
    edition,
    items
}: {
    survey: Survey
    edition: Edition
    items: Question[]
}): ResolverMap => ({
    items: async (parent, args, context, info) => {
        const { edition, questionObjects } = parent
        return items
            .map(question => ({
                ...parent,
                question: questionObjects.find(q => q.id === question.id)!
            }))
            .filter(item => item.question.editions?.includes(edition.id))
    },
    ids: () => {
        return items.map(q => q.id)
    },
    years: () => {
        return survey.editions.map(e => e.year)
    }
})
