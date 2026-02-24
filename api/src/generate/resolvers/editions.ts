import { Entity, ResultsSubFieldEnum } from '@devographics/types'
import { getGenericCacheKey, genericComputeFunction } from '../../compute'
import { useCache } from '../../helpers/caching'
import { EditionApiObject, RequestContext, ResolverType, SurveyApiObject } from '../../types'
import { getEditionById } from '../helpers'
import { EditionSectionMetadataArgs, filterItems } from '../resolvers'
import { getEntities } from '../../load/entities'
import intersection from 'lodash/intersection.js'
import uniqBy from 'lodash/uniqBy.js'
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
} /*

See getSurveyMetadataResolver() note above

*/
export const getEditionMetadataResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log(`// edition metadata resolver: ${edition.id}`)
        const freshEdition = await getEditionById(edition.id)
        /* 
        
        none of this seems necessary?

        */
        // const sections = freshEdition.sections.map(section => ({
        //     ...section,
        //     questions:
        //         section.questions &&
        //         section.questions
        //             .filter(question => question?.editions?.includes(edition.id))
        //             .map(q => ({ ...q, editionId: edition.id }))
        // }))
        return { ...freshEdition, surveyId: survey.id, survey }
    }

export const getEditionCodebookResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    async (parent, args, context, info) => {
        console.log(`// edition codebook resolver: ${edition.id}`)
        const allEntities = await getEntities({ includeNormalizationEntities: true })

        const freshEdition = await getEditionById(edition.id)
        let entities: Entity[] = []
        for (const section of freshEdition.sections) {
            if (section.questions) {
                for (const question of section.questions) {
                    const matchTags = question?.matchTags
                    const questionEntities = allEntities.filter(
                        e => intersection(e.tags, matchTags).length > 0
                    )
                    entities = [...entities, ...questionEntities]
                }
            }
        }
        entities = uniqBy(entities, e => e.id)
        return { entities, entitiesCount: entities.length }
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
export const getEditionResolver =
    ({ survey, edition }: { survey: SurveyApiObject; edition: EditionApiObject }): ResolverType =>
    (parent, args, context, info) => {
        console.log(`// edition resolver: ${edition.id}`)
        return edition
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
