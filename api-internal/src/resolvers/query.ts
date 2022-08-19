import { getEntities, getEntity } from '../entities'
import { getLocales, getLocaleObject, getTranslation } from '../i18n'

export default {
    Query: {
        entity: async (parent: any, { id }: { id: string }) => ({
            ...(await getEntity({ id }))
        }),
        entities: (
            parent: any,
            { ids, type, tag, tags }: { ids: string[]; type: string; tag: string; tags: string[] }
        ) => getEntities({ ids, type, tag, tags }),
        translation: (parent: any, { key, localeId }: { key: string; localeId: string }) =>
            getTranslation(key, localeId),
        locale: (
            parent: any,
            {
                localeId,
                contexts,
                enableFallbacks
            }: { localeId: string; contexts: string[]; enableFallbacks?: boolean }
        ) => getLocaleObject(localeId, contexts, enableFallbacks),
        locales: (
            parent: any,
            {
                contexts,
                localeIds,
                enableFallbacks
            }: { contexts: string[]; localeIds: string[]; enableFallbacks?: boolean }
        ) => getLocales(contexts, enableFallbacks, localeIds)
    }
}
