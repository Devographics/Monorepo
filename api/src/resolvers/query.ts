import { SurveyType } from '../types'
import { getEntities, getEntity } from '../entities'
import { getLocales, getLocaleObject, getTranslation } from '../i18n'
import { SurveyConfig } from '../types'

export default {
    Query: {
        survey: (parent: any, { survey }: { survey: SurveyType }) => ({
            survey
        }),
        entity: async (survey: SurveyConfig, { id }: { id: string }) => ({
            survey,
            ...(await getEntity({ id }))
        }),
        entities: (
            parent: any,
            { type, tag, tags }: { type: string; tag: string, tags: string[] }
        ) => getEntities({ type, tag, tags }),
        translation: (parent: any, { key, localeId }: { key: string; localeId: string }) =>
            getTranslation(key, localeId),
        locale: (parent: any, { localeId, contexts, enableFallbacks }: { localeId: string; contexts: string[], enableFallbacks?: boolean }) =>
            getLocaleObject(localeId, contexts, enableFallbacks),
        locales: (parent: any, { contexts, enableFallbacks }: { contexts: string[], enableFallbacks?: boolean }) => getLocales(contexts, enableFallbacks)
    }
}
