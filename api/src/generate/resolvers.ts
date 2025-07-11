import {
    SurveyApiObject,
    EditionApiObject,
    QuestionApiObject,
    TypeObject,
    ResolverType,
    ResolverMap,
    ResolverParent,
    IncludeEnum
} from '../types/surveys'
import {
    getPath,
    getEditionById,
    getSectionType,
    getGeneralMetadata,
    addGroupsAverages,
    addOptionsAverages
} from './helpers'
import { genericComputeFunction, getGenericCacheKey } from '../compute'
import { useCache } from '../helpers/caching'
import { getRawCommentsWithCache } from '../compute/comments'
import { getEntity, getEntities } from '../load/entities'
import omit from 'lodash/omit.js'
import { entitiesResolvers, entityResolverMap } from '../resolvers/entities'
import { getResponseTypeName } from '../graphql/templates/responses'
import { RequestContext, SectionApiObject } from '../types'
import { getSectionItems, getEditionItems } from './helpers'
import { stringOrInt } from '../graphql/string_or_int'
import { GraphQLScalarType } from 'graphql'
import { localesResolvers } from '../resolvers/locales'
import { subFields } from './subfields'
import { Creator, ResultsSubFieldEnum } from '@devographics/types'
import { loadOrGetSurveys } from '../load/surveys'
import { sitemapBlockResolverMap } from '../resolvers/sitemap'
import { getRawData } from '../compute/raw'
import StringOrFloatOrArray from '../graphql/string_or_array'
import { getCardinalities } from '../compute/cardinalities'
import { calculateWordFrequencies } from '@devographics/helpers'

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
        Query: {
            _metadata: getGlobalMetadataResolver(),
            surveys: () => surveys,
            ...entitiesResolvers,
            ...localesResolvers
        },
        GeneralMetadata: generalMetadataResolverMap,
        Creator: creatorResolverMap,
        Surveys: surveysFieldsResolvers,
        ItemComments: commentsResolverMap,
        CreditItem: creditResolverMap,
        Entity: entityResolverMap,
        EditionMetadata: editionMetadataResolverMap,
        SectionMetadata: sectionMetadataResolverMap,
        QuestionMetadata: questionMetadataResolverMap,
        SitemapBlock: sitemapBlockResolverMap,
        SitemapBlockVariant: sitemapBlockResolverMap,
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

                    if (sectionTypeObject) {
                        // generate resolver map for each section field (i.e. each section question)
                        resolvers[sectionTypeObject.typeName] = Object.fromEntries(
                            questionsToInclude.map((questionObject: QuestionApiObject) => {
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

                    for (const questionObject of questionsToInclude) {
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
    // console.log(resolvers)
    return resolvers
}

/*

Always get a fresh copy of `surveys` from memory

*/
const getGlobalMetadataResolver = (): ResolverType => async (parent, args, context) => {
    console.log('// getGlobalMetadataResolver')
    const { surveyId, editionId } = args
    const isDevOrTest = !!(
        process.env.NODE_ENV && ['test', 'development'].includes(process.env.NODE_ENV)
    )
    const { surveys } = await loadOrGetSurveys()
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
    return { surveys: filteredSurveys, general: {} }
}

export const generalMetadataResolverMap = {
    creators: async (parent_: any, context: RequestContext) => {
        console.log('// creators resolver')

        const general = getGeneralMetadata({ context })
        return general.creators
    }
}

export const creatorResolverMap = {
    entity: async (parent: Creator, {}, context: RequestContext) => {
        console.log('// creators entity resolver')
        const { id } = parent
        const entity = await getEntity({ id, context })
        return entity
    }
}

const getSurveyResolver =
    ({ survey }: { survey: SurveyApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log(`// survey resolver: ${survey.id}`)
        return survey
    }

/*

Note: although a survey object is passed as argument, that object
may be stale if surveys have been reinitialized since app start. 
So we only use its id and then make sure to get a "fresh"
copy of the survey metadata from memory

*/
const getSurveyMetadataResolver =
    ({ survey }: { survey: SurveyApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log(`// survey metadata resolver: ${survey.id}`)
        const { surveys } = await loadOrGetSurveys()
        const freshSurvey = surveys.find(s => s.id === survey.id)
        return freshSurvey
    }

const getEditionResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log(`// edition resolver: ${edition.id}`)
        return edition
    }

/*

See getSurveyMetadataResolver() note above

*/
const getEditionMetadataResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log(`// edition metadata resolver: ${edition.id}`)
        const freshEdition = await getEditionById(edition.id)
        const sections = freshEdition.sections.map(section => ({
            ...section,
            questions: section.questions
                .filter(question => question?.editions?.includes(edition.id))
                .map(q => ({ ...q, editionId: edition.id }))
        }))
        return { ...freshEdition, surveyId: survey.id, survey, sections }
    }

const getSectionResolver =
    ({
        survey,
        edition,
        section,
        questionObjects
    }: {
        survey: SurveyApiObject
        edition: EditionApiObject
        section: SectionApiObject
        questionObjects: QuestionApiObject[]
    }): ResolverType =>
    async (parent, args, context, info) => {
        console.log('// section resolver')
        const type = getSectionType(section)
        const _items = await getItems({
            survey,
            edition,
            section,
            type,
            context
        })
        const _cardinalities = await getCardinalities({
            survey,
            edition,
            section,
            type,
            questionObjects,
            context
        })
        return {
            ...section,
            _items,
            _cardinalities
        }
    }

const getQuestionResolverMap = async ({
    questionObject
}: {
    questionObject: QuestionApiObject
}) => {
    if (questionObject.resolverMap) {
        return questionObject.resolverMap
    } else {
        const resolverMap = {} as { [key in ResultsSubFieldEnum]: ResolverType }
        subFields.forEach(async ({ id, addIf, addIfAsync, resolverFunction }) => {
            const addSubField = addIfAsync
                ? await addIfAsync(questionObject)
                : addIf(questionObject)
            if (resolverFunction && addSubField) {
                resolverMap[id] = resolverFunction
            }
        })
        return resolverMap
    }
}

const getQuestionResolver =
    (data: ResolverParent): ResolverType =>
    async () => {
        console.log('// question resolver')
        return data
    }

/*

Responses 

*/
export const allEditionsResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// allEditionsResolver')
    if (process.env.DISABLE_DATA_ACCESS && process.env.DISABLE_DATA_ACCESS !== 'false') {
        throw new Error(`Data access currently disabled. Set DISABLE_DATA_ACCESS=false to enable`)
    }
    const subField: ResultsSubFieldEnum = info?.path?.prev?.key

    const { survey, edition, section, question, responseArguments, questionObjects } = parent
    const {
        parameters = {},
        filters,
        facet,
        responsesType = subField,
        bucketsFilter
    } = responseArguments || {}

    const { editionCount, editionId: selectedEditionId } = args
    const computeArguments = {
        responsesType,
        bucketsFilter,
        parameters,
        filters,
        facet,
        selectedEditionId,
        editionCount
    }
    const funcOptions = {
        survey,
        edition,
        section,
        question,
        context,
        questionObjects,
        computeArguments
    }
    const cacheKeyOptions = {
        edition,
        question,
        subField,
        selectedEditionId,
        editionCount,
        parameters,
        filters,
        facet
    }

    let result = await useCache({
        key: getGenericCacheKey(cacheKeyOptions),
        func: genericComputeFunction,
        context,
        funcOptions,
        enableCache: parameters.enableCache
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
        { editionId: parent.edition.id },
        context,
        info
    )
    return result[0]
}

export const rawDataResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// rawDataResolver')
    const { survey, edition, section, question } = parent
    const { token } = args
    const rawData = await getRawData({ survey, edition, section, question, context, token })
    return rawData
}

export const rawDataStatsResolver: ResolverType = async (parent, args, context, info) => {
    console.log('// rawDataStatsResolver')
    const { survey, edition, section, question } = parent
    const { token } = args
    const rawData = await getRawData({ survey, edition, section, question, context, token })
    const rawDataStats = rawData && calculateWordFrequencies(rawData.map(item => item.raw))
    return rawDataStats
}

export const responsesResolverMap: ResolverMap = {
    allEditions: allEditionsResolver,
    currentEdition: currentEditionResolver,
    rawData: rawDataResolver,
    rawDataStats: rawDataStatsResolver
}
/*

Comments

*/
export const commentsResolverMap: ResolverMap = {
    allEditions: async ({ survey, question }, args, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            context,
            args
        }),
    currentEdition: async ({ survey, edition, question, args }, args2, context) =>
        await getRawCommentsWithCache({
            survey,
            question,
            editionId: edition.id,
            context,
            args
        })
}

/*

Credit

*/
export const creditResolverMap = {
    entity: async ({ id }: { id: string }, {}, context: RequestContext) =>
        await getEntity({ id, context })
}

const filterItems = (items: Array<SectionApiObject | QuestionApiObject>, include: IncludeEnum) => {
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

type EditionSectionMetadataArgs = {
    include: IncludeEnum
}

/*

Edition Metadata (remove "virtual" apiOnly questions from metadata if needed)

*/
export const editionMetadataResolverMap = {
    sections: async (
        parent: EditionApiObject,
        args: EditionSectionMetadataArgs,
        context: RequestContext
    ) => {
        return filterItems(parent.sections, args.include).map(s => ({ ...s, ...args }))
    }
}

/*

Section Metadata (remove "virtual" apiOnly questions from metadata if needed)

*/
export const sectionMetadataResolverMap = {
    questions: async (
        parent: SectionApiObject & { include: IncludeEnum },
        args: EditionSectionMetadataArgs,
        context: RequestContext
    ) => {
        return filterItems(parent.questions, parent.include)
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
        if (!options) {
            return
        }
        const optionEntities = await getEntities({
            ids: options?.map(o => o.id),
            context
        })
        const currentEditionOptions = options.filter(option =>
            option.editions?.includes(editionId!)
        )
        const optionsWithEntities = currentEditionOptions.map(option => ({
            ...omit(option, 'editions'),
            entity: optionEntities.find(o => o.id === option.id)
        }))
        // avoid repeating the options for feature and tool questions
        // since there's so many of them
        // NOTE: disabled since it does saves a few kb, but at the cost of a lot of downstream complexity
        // return ['feature', 'tool'].includes(template) ? [] : optionsWithEntities

        // add averages if needed
        const optionsWithAverages = addOptionsAverages(optionsWithEntities)
        return optionsWithAverages
    },
    groups: async (parent: QuestionApiObject, {}, context: RequestContext) => {
        const { groups } = parent
        if (!groups) {
            return
        }
        const groupsWithAverages = addGroupsAverages(groups)
        return groupsWithAverages
    }
}

/*

Other Resolvers

*/
export const entityResolverFunction: ResolverType = ({ question }, args, context) =>
    getEntity({ id: question.id, context })

export const idResolverFunction: ResolverType = ({ question }) => question.id

/*

Resolver map used for all_features, all_tools

*/
export const getEditionToolsFeaturesResolverMap = (type: 'tools' | 'features'): ResolverMap => ({
    items: parent =>
        getEditionItems(parent.edition, type).map(question => ({ ...parent, question })),
    ids: parent => getEditionItems(parent.edition, type).map(q => q.id),
    years: parent => parent.survey.editions.map(e => e.year)
})

/*

Resolver map used for section_features, section_tools

*/

// if this is the main "Features" or "Tools" section, return every item; else return
// only items for current section

const getItems = async ({
    survey,
    edition,
    section,
    type,
    context
}: {
    survey: SurveyApiObject
    edition: EditionApiObject
    section: SectionApiObject
    type: 'tools' | 'features'
    context: RequestContext
}) => {
    const items = ['features', 'tools', 'libraries'].includes(section.id)
        ? getEditionItems(edition, type)
        : getSectionItems(section, type)

    return items.map(async question => ({
        survey,
        edition,
        section,
        question,
        entity: await getEntity({ id: question.id, context })
    }))
}

export const getSectionToolsFeaturesResolverMap = async (
    type: 'tools' | 'features'
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
