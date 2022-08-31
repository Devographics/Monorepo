import { getEntities, getEntity } from '../entities'
import { getLocales, getLocale, getTranslation } from '../locales'
import { RequestContext } from '../types'

export default {
    Query: {
        entity: async (parent: any, { id }: { id: string }) => ({
            ...(await getEntity({ id }))
        }),
        entities: (
            parent: any,
            { ids, type, tag, tags }: { ids: string[]; type: string; tag: string; tags: string[] }
        ) => getEntities({ ids, type, tag, tags }),
        translation: (
            parent: any,
            { key, localeId }: { key: string; localeId: string },
            context: RequestContext
        ) => getTranslation(key, localeId, context),
        locale: (
            parent: any,
            {
                localeId,
                contexts,
                enableFallbacks
            }: { localeId: string; contexts: string[]; enableFallbacks?: boolean },
            context: RequestContext
        ) => getLocale({ localeId, contexts, enableFallbacks, context }),
        locales: (
            parent: any,
            {
                contexts,
                localeIds,
                enableFallbacks
            }: { contexts: string[]; localeIds: string[]; enableFallbacks?: boolean },
            context: RequestContext
        ) => getLocales({ contexts, enableFallbacks, localeIds, context })
    }
}
