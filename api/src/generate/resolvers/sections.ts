import { getSectioni18nIds, makeTranslatorFunc } from '@devographics/i18n'
import { SectionMetadata } from '@devographics/types'
import { loadOrGetLocales } from '../../load/locales/locales'
import { unconvertLocaleId } from './locales'
import {
    SurveyApiObject,
    EditionApiObject,
    SectionApiObject,
    QuestionApiObject,
    ResolverType,
    IncludeEnum,
    RequestContext
} from '../../types'
import { EditionSectionMetadataArgs, filterItems } from '../resolvers'

export const getSectionResolver =
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
        console.log(`// section resolver: ${section.id}`)
        return section
    } /*

Section Metadata (remove "virtual" apiOnly questions from metadata if needed)

*/

export const sectionMetadataResolverMap = {
    questions: async (
        parent: SectionApiObject & { include: IncludeEnum },
        args: EditionSectionMetadataArgs,
        context: RequestContext
    ) => {
        return filterItems(parent.questions, parent.include)
    },
    translationKeys: async (parent: SectionApiObject, {}, context: RequestContext) => {
        const section = parent as SectionMetadata
        const i18nIds = getSectioni18nIds({ section })
        return { ...i18nIds, name: i18nIds.base }
    },
    translations: async (parent: SectionApiObject, {}, context: RequestContext) => {
        const section = parent as SectionMetadata
        const i18nIds = getSectioni18nIds({ section })
        const locales = await loadOrGetLocales()
        const translations = locales.map(locale => {
            const getMessage = makeTranslatorFunc(locale)

            const name = getMessage(i18nIds.title)?.t
            const prompt = getMessage(i18nIds.prompt)?.t

            return {
                localeId: unconvertLocaleId(locale.id),
                name,
                prompt
            }
        })
        return translations
    }
}
