import { Survey, Edition, Section, QuestionObject } from './types'
import { TypeObject, ResolverType, ResolverMap } from './types'
import { getPath, getSectionQuestionObjects } from './helpers'
import { genericComputeFunction } from '../compute'
import { useCache, computeKey } from '../caching'
import { getRawCommentsWithCache } from '../compute/comments'
import { getEntity } from '../entities'

export const generateResolvers = async ({
    surveys,
    questionObjects,
    typeObjects
}: {
    surveys: Survey[]
    questionObjects: QuestionObject[]
    typeObjects: TypeObject[]
}) => {
    // generate resolver map for root survey fields (i.e. each survey)
    const surveysFieldsResolvers = Object.fromEntries(
        surveys.map((survey: Survey) => {
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
        Responses: responsesResolverMap,
        ItemComments: commentsResolverMap
        // Entity: ({ question }) => getEntity({ id: question.id })
    } as any

    for (const survey of surveys) {
        // generate resolver map for each survey field (i.e. each survey edition)
        const surveyFieldsResolvers = Object.fromEntries(
            survey.editions.map((edition: Edition) => {
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
            // generate resolver map for each edition field (i.e. each edition section)
            const editionTypeObject = typeObjects.find(t => t.path === getPath({ survey, edition }))
            if (editionTypeObject) {
                const editionFieldsResolvers = Object.fromEntries(
                    edition?.sections?.map((section: Section) => {
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

            if (edition.sections) {
                for (const section of edition.sections) {
                    // generate resolvers for each section
                    const sectionTypeObject = typeObjects.find(
                        t => t.path === getPath({ survey, edition, section })
                    )

                    // make sure to get "rich" questions from questionObjects
                    // and not "raw" questions from edition.questions
                    const sectionQuestionObjects = getSectionQuestionObjects({
                        survey,
                        section,
                        edition,
                        questionObjects
                    })

                    if (sectionTypeObject) {
                        // generate resolver map for each section field (i.e. each section question)
                        resolvers[sectionTypeObject.typeName] = Object.fromEntries(
                            sectionQuestionObjects.map(questionObject => {
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

                    for (const questionObject of sectionQuestionObjects) {
                        resolvers[questionObject.fieldTypeName] = questionObject.resolverMap || {
                            responses: responsesResolverFunction
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
    ({ survey }: { survey: Survey }): ResolverType =>
    (root, args, context, info) => {
        console.log('// survey resolver')
        return survey
    }

const getSurveyMetadataResolver =
    ({ survey }: { survey: Survey }): ResolverType =>
    (root, args, context, info) => {
        console.log('// survey metadata resolver')
        return survey
    }
const getEditionResolver =
    ({ survey, edition }: { survey: Survey; edition: Edition }): ResolverType =>
    (root, args, context, info) => {
        console.log('// edition resolver')
        return edition
    }

const getEditionMetadataResolver =
    ({ survey, edition }: { survey: Survey; edition: Edition }): ResolverType =>
    (root, args, context, info) => {
        console.log('// edition metadata resolver')
        return edition
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
    (root, args, context, info) => {
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
        question: QuestionObject
    }): ResolverType =>
    (root, args, context, info) => {
        console.log('// question resolver')
        const { filters, options, facet } = args

        return {
            survey,
            edition,
            section,
            question,
            computeOptions: {
                filters,
                options,
                facet
            }
        }
    }

/*

Responses 

*/

// empty pass-through resolver
export const responsesResolverFunction: ResolverType = root => {
    console.log('// responses resolver')
    return root
}

export const yearsResolver: ResolverType = async (root, args, context, info) => {
    console.log('// yearsResolver')
    const { survey, edition, section, question, computeOptions } = root
    const { year } = args
    return await useCache({
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
            options: { ...computeOptions, year }
        }
    })
}

export const yearResolver: ResolverType = async (root, args, context, info) => {
    console.log('// yearResolver')
    const result = await yearsResolver(root, args, context, info)
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
export const commentsResolverFunction: ResolverType = root => {
    console.log('// comments resolver')
    return root
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

Entities

*/
export const entityResolverFunction: ResolverType = ({ question }) => getEntity({ id: question.id })
