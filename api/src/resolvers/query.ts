import { SurveyType } from '../types'
import { getEntities, getEntity } from '../entities'
import { getLocales, getLocaleObject, getTranslation } from '../i18n'
import { SurveyConfig } from '../types'
import surveys from '../surveys'

export default {
    Query: {
        surveys: () => surveys,
        survey: (parent: any, { survey }: { survey: SurveyType }) => ({
            survey
        }),
        // entity: async (survey: SurveyConfig, { id }: { id: string }) => ({
        //     survey,
        //     ...(await getEntity({ id }))
        // }),
        // entities: (
        //     parent: any,
        //     { ids, type, tag, tags }: { ids: string[]; type: string; tag: string; tags: string[] }
        // ) => getEntities({ ids, type, tag, tags }),
        // translation: (parent: any, { key, localeId }: { key: string; localeId: string }) =>
        //     getTranslation(key, localeId),
        // locale: (
        //     parent: any,
        //     {
        //         localeId,
        //         contexts,
        //         enableFallbacks
        //     }: { localeId: string; contexts: string[]; enableFallbacks?: boolean }
        // ) => getLocaleObject(localeId, contexts, enableFallbacks),
        // locales: (
        //     parent: any,
        //     {
        //         contexts,
        //         localeIds,
        //         enableFallbacks
        //     }: { contexts: string[]; localeIds: string[]; enableFallbacks?: boolean }
        // ) => getLocales(contexts, enableFallbacks, localeIds)
    }
}
