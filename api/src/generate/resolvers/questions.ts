import { ResultsSubFieldEnum, SectionMetadata } from '@devographics/types'
import { QuestionApiObject, RequestContext, ResolverParent, ResolverType } from '../../types'
import { subFields } from '../subfields'
import { getQuestioni18nIds, makeTranslatorFunc } from '@devographics/i18n'
import omit from 'lodash/omit.js'
import { getEntity, getEntities } from '../../load/entities'
import { loadOrGetLocales } from '../../load/locales/locales'
import { unconvertLocaleId } from './locales'
import { addOptionsAverages, addGroupsAverages } from '../helpers'

export const getQuestionResolverMap = async ({
    questionObject
}: {
    questionObject: QuestionApiObject
}) => {
    if (questionObject.resolverMap) {
        return questionObject.resolverMap
    } else {
        const resolverMap = {} as {
            [key in ResultsSubFieldEnum]: ResolverType
        }
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

export const getQuestionResolver =
    (data: ResolverParent, context: RequestContext): ResolverType =>
    async () => {
        console.log('// question resolver')
        const { survey, edition, section, question, questionObjects } = data
        if (question?.resolver) {
            return question.resolver(data, {}, context, {})
        }
        return data
    } /*

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
        console.log('// question metadata entity resolver')
        const { id } = parent
        const entity = await getEntity({ id, context })
        return entity
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
    },
    translationKeys: async (parent: QuestionApiObject, {}, context: RequestContext) => {
        const question = parent
        const section = question.section as SectionMetadata
        if (!section) {
            return
        }
        const i18nIds = getQuestioni18nIds({ section, question })
        return { ...i18nIds, name: i18nIds.base }
    },
    translations: async (parent: QuestionApiObject, {}, context: RequestContext) => {
        const question = parent
        const section = question.section as SectionMetadata
        if (!section) {
            return
        }
        const entity = await getEntity({ id: question.id, context })
        const i18nIds = getQuestioni18nIds({ section, question })
        const locales = await loadOrGetLocales()
        const translations = locales.map(locale => {
            const isEn = locale.id === 'en-US'
            const getMessage = makeTranslatorFunc(locale)

            const nameFallback = isEn ? entity?.name : undefined
            const name = getMessage(i18nIds.base, {}, nameFallback)?.t
            const question = getMessage(i18nIds.question)?.t
            const promptFallback = isEn ? entity?.description : undefined
            const prompt = getMessage(i18nIds.prompt, {}, promptFallback)?.t

            return {
                localeId: unconvertLocaleId(locale.id),
                name,
                question,
                prompt
            }
        })
        return translations
    }
}
