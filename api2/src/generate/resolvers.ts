import {
    ParsedSurvey,
    ParsedEdition,
    Survey,
    Edition,
    Section,
    ParsedQuestion,
    ParsedSection,
    Option,
    TypeObject,
    ResolverType,
    ResolverMap
} from '../types/surveys'
import { getPath, mergeSections, formatNumericOptions } from './helpers'
import { genericComputeFunction } from '../compute'
import { useCache, computeKey } from '../helpers/caching'
import { getRawCommentsWithCache } from '../compute/comments'
import { getEntity, getEntities } from '../load/entities'
import omit from 'lodash/omit.js'
import pick from 'lodash/pick.js'
import { entityResolverMap } from '../resolvers/entities'
import { getResponseTypeName } from '../graphql/templates/responses'

export const generateResolvers = async ({
    surveys,
    typeObjects
}: {
    surveys: ParsedSurvey[]
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
        Query: { surveys: () => surveys },
        Surveys: surveysFieldsResolvers,
        ItemComments: commentsResolverMap,
        Entity: entityResolverMap
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
                            section.questions.map(questionObject => {
                                return [
                                    questionObject.id,
                                    getQuestionResolver({
                                        survey,
                                        edition,
                                        section,
                                        question: questionObject
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

const getSurveyResolver =
    ({ survey }: { survey: ParsedSurvey }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// survey resolver')
        return survey
    }

const getSurveyMetadataResolver =
    ({ survey }: { survey: ParsedSurvey }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// survey metadata resolver')
        return survey
    }
const getEditionResolver =
    ({ survey, edition }: { survey: ParsedSurvey; edition: ParsedEdition }): ResolverType =>
    (parent, args, context, info) => {
        console.log('// edition resolver')
        return edition
    }

const getEditionMetadataResolver =
    ({ survey, edition }: { survey: ParsedSurvey; edition: ParsedEdition }): ResolverType =>
    async (parent, args, context, info) => {
        console.log('// edition metadata resolver')
        const sections = edition.sections.map(section => ({
            ...section,
            questions: section.questions
                .filter(question => question?.editions?.includes(edition.id))
                .map(async question => {
                    const pickProperties = [
                        'id',
                        'intlId',
                        'template',
                        'dbPath',
                        'dbPathComments',
                        'options'
                    ]
                    const cleanQuestion = {
                        ...pick(question, pickProperties),
                        entity: getEntity({ id: question.id, context })
                    }
                    const optionEntities = await getEntities({
                        ids: question.options?.map(o => o.id),
                        context
                    })

                    const options = question.options
                        ?.filter(o => o.editions?.includes(edition.id))
                        .map(option => ({
                            ...omit(option, 'editions'),
                            entity: optionEntities.find(o => o.id === option.id)
                        }))
                    // avoid repeating the options for feature and tool questions
                    // since there's so many of them
                    return ['feature', 'tool'].includes(question.template)
                        ? cleanQuestion
                        : { ...cleanQuestion, options }
                })
        }))
        return { ...edition, sections }
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
    ({
        survey,
        edition,
        section,
        question
    }: {
        survey: Survey
        edition: Edition
        section: Section
        question: ParsedQuestion
    }): ResolverType =>
    async (parent, args, context, info) => {
        console.log('// question resolver')
        const { filters, parameters, facet } = args

        const result: any = {
            survey,
            edition,
            section,
            question,
            computeOptions: {
                filters,
                parameters,
                facet
            }
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

// empty pass-through resolver
export const responsesResolverFunction: ResolverType = parent => {
    console.log('// responses resolver')
    return parent
}

export const yearsResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// yearsResolver')
    const { survey, edition, section, question, computeOptions } = parent
    const { year } = args
    let result = await useCache({
        key: computeKey(genericComputeFunction, {
            surveyId: survey.id,
            editionId: edition.id,
            sectionId: section.id,
            questionId: question.id,
            ...computeOptions,
            year
        }),
        func: genericComputeFunction,
        context,
        funcOptions: {
            survey,
            edition,
            section,
            question,
            context,
            parameters: { ...computeOptions, year }
        }
    })
    if (question.transformFunction) {
        result = question.transformFunction(parent, result, context)
    }
    return result
}

export const yearResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// yearResolver')
    const result = await yearsResolver(parent, args, context, info)
    return result[0]
}

export const responsesResolverMap: ResolverMap = {
    all_years: yearsResolver,
    year: yearResolver
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
    all_years: async ({ survey, question }, {}, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            context
        }),
    year: async ({ survey, question }, { year }: { year: number }, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            year,
            context
        })
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
    items
}: {
    survey: Survey
    items: ParsedQuestion[]
}): ResolverMap => ({
    data: async (parent, args, context, info) => {
        return items.map(question => ({ ...parent, question }))
    },
    ids: () => {
        return items.map(q => q.id)
    },
    years: () => {
        return survey.editions.map(e => e.year)
    }
})
