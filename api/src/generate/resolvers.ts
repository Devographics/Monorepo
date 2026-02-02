import {
    SurveyApiObject,
    QuestionApiObject,
    TypeObject,
    ResolverMap,
    IncludeEnum
} from '../types/surveys'
import { getPath, getSectionType } from './helpers'
import {
    entitiesResolvers,
    entityAppearanceResolverMap,
    entityResolverMap
} from '../resolvers/entities'
import { getResponseTypeName } from '../graphql/templates/responses'
import { RequestContext, SectionApiObject } from '../types'
import { getEditionItems } from './helpers'
import { stringOrInt } from '../graphql/string_or_int'
import { GraphQLScalarType } from 'graphql'
import { localesResolvers } from '../resolvers/locales'
import { ApiSectionTypes } from '@devographics/types'
import { sitemapBlockResolverMap } from '../resolvers/sitemap'
import StringOrFloatOrArray from '../graphql/string_or_array'
import { CARDINALITIES_ID, ITEMS_ID } from '@devographics/constants'
import { logToFile } from '@devographics/debug'
import util from 'util'
import { getItems, isFeatureSection, isLibrarySection } from '../helpers/sections'
import { getCardinalitiesResolver, getItemsResolver } from './templates'
import { cardinalitiesResolverMap } from './resolvers/cardinalities'
import {
    getQuestionResolver,
    getQuestionResolverMap,
    questionMetadataResolverMap
} from './resolvers/questions'
import { getSectionResolver, sectionMetadataResolverMap } from './resolvers/sections'
import {
    editionMetadataResolverMap,
    getEditionMetadataResolver,
    getEditionResolver
} from './resolvers/editions'
import { getSurveyMetadataResolver, getSurveyResolver } from './resolvers/surveys'
import { commentsResolverMap } from './resolvers/comments'
import { creditResolverMap } from './resolvers/credits'
import { responsesResolverMap } from './resolvers/responses'
import { creatorResolverMap } from './resolvers/creator'
import { getGlobalMetadataResolver } from './resolvers/global_metadata'
import { generalMetadataResolverMap } from './resolvers/general_metadata'

export const generateResolvers = async ({
    surveys,
    questionObjects,
    typeObjects,
    context
}: {
    surveys: SurveyApiObject[]
    questionObjects: QuestionApiObject[]
    typeObjects: TypeObject[]
    context: RequestContext
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

    // Root query resolvers
    const Query = {
        _metadata: getGlobalMetadataResolver(),
        surveys: () => surveys,
        ...entitiesResolvers,
        ...localesResolvers
    }

    // Resolvers for "static" types that are not generated dynamically based
    // on survey outlines
    const resolvers = {
        // Root query resolvers
        Query,
        GeneralMetadata: generalMetadataResolverMap,
        Creator: creatorResolverMap,
        // main surveys resolver
        Surveys: surveysFieldsResolvers,
        ItemComments: commentsResolverMap,
        CreditItem: creditResolverMap,
        Entity: entityResolverMap,
        EntityAppearance: entityAppearanceResolverMap,
        EditionMetadata: editionMetadataResolverMap,
        SectionMetadata: sectionMetadataResolverMap,
        QuestionMetadata: questionMetadataResolverMap,
        SitemapBlock: sitemapBlockResolverMap,
        SitemapBlockVariant: sitemapBlockResolverMap,
        CardinalitiesItem: cardinalitiesResolverMap,
        // Scalars
        StringOrInt: new GraphQLScalarType(stringOrInt),
        StringOrFloatOrArray: new GraphQLScalarType(StringOrFloatOrArray)
    } as any

    for (const survey of surveys) {
        resolvers[getResponseTypeName()] = responsesResolverMap

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
                        edition.sections.map(section => {
                            return [
                                section.id,
                                getSectionResolver({
                                    survey,
                                    edition,
                                    section,
                                    questionObjects
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

                    const questionsToInclude = section.questions.filter(
                        q => q.hasApiEndpoint !== false
                    )

                    if (isFeatureSection(section) || isLibrarySection(section)) {
                        // feature/library sections get these two resolvers
                        // automatically added to them
                        questionsToInclude.push({
                            id: ITEMS_ID,
                            resolver: getItemsResolver(getSectionType(section), context)
                        } as unknown as QuestionApiObject)
                        questionsToInclude.push({
                            id: CARDINALITIES_ID,
                            resolver: getCardinalitiesResolver(getSectionType(section))
                        } as unknown as QuestionApiObject)
                    }

                    if (sectionTypeObject) {
                        // generate resolver map for each section field (i.e. each section question)
                        resolvers[sectionTypeObject.typeName] = Object.fromEntries(
                            questionsToInclude.map((questionObject: QuestionApiObject) => {
                                return [
                                    questionObject.id,
                                    getQuestionResolver(
                                        {
                                            survey,
                                            edition,
                                            section,
                                            question: questionObject,
                                            questionObjects
                                        },
                                        context
                                    )
                                ]
                            })
                        )
                    }

                    // generate resolvers for the types used by the section's question
                    for (const questionObject of questionsToInclude) {
                        // note: each iteration will overwrite earlier definitions for one resolver map
                        // with later ones, so that the final resolver map should be based
                        // on the most recent survey
                        if (questionObject.fieldTypeName) {
                            const questionResolverMap = await getQuestionResolverMap({
                                questionObject
                            })
                            resolvers[questionObject.fieldTypeName] = questionResolverMap
                        }
                    }
                }
            }
        }
    }
    await logToFile('resolvers.js', util.inspect(resolvers))
    return resolvers
}

export const filterItems = (
    items: Array<SectionApiObject | QuestionApiObject>,
    include: IncludeEnum
) => {
    switch (include) {
        case IncludeEnum.OUTLINE_ONLY:
            return items.filter(q => q.apiOnly !== true)

        case IncludeEnum.API_ONLY:
            return items.filter(q => q.apiOnly === true)

        case IncludeEnum.ALL:
        default:
            return items
    }
}

export type EditionSectionMetadataArgs = {
    include: IncludeEnum
}

/*

Resolver map used for all_features, all_tools

NOT_USED?

*/
export const getEditionToolsFeaturesResolverMap = (type: ApiSectionTypes): ResolverMap => ({
    items: parent =>
        getEditionItems(parent.edition, type).map(question => ({ ...parent, question })),
    ids: parent => getEditionItems(parent.edition, type).map(q => q.id),
    years: parent => parent.survey.editions.map(e => e.year)
})

// NOT USED?
export const getSectionToolsFeaturesResolverMap = async (
    type: ApiSectionTypes
): Promise<ResolverMap> => ({
    items: async (parent, args, context) =>
        await getItems({
            survey: parent.survey,
            edition: parent.edition,
            section: parent.section,
            type,
            context
        }),
    ids: async (parent, args, context) =>
        (
            await getItems({
                survey: parent.survey,
                edition: parent.edition,
                section: parent.section,
                type,
                context
            })
        ).map(q => q.question.id),
    years: parent => parent.survey.editions.map(e => e.year)
})
