import { getEntities, getEntity } from '../entities'
import { getLocales, getLocaleObject, getTranslation } from '../i18n'
import type { Resolvers } from '../generated/graphql'

export const Query: Resolvers['Query'] = {
    survey: async (parent, { survey }) => ({
        survey
    }),
    entity: async (survey, { id }) => ({
        survey,
        ...(await getEntity({ id }))
    }),
    entities: async (
        parent,
        { ids, type, tag, tags }
    ) => getEntities({ ids, type, tag, tags }),
    translation: async (parent, { key, localeId }) => getTranslation(key, localeId),
    locale: async (parent, {
        localeId,
        contexts,
        enableFallbacks
    }) => getLocaleObject(localeId, contexts, enableFallbacks),
    locales: async (parent, {
        contexts,
        localeIds,
        enableFallbacks
    }) => getLocales(contexts, enableFallbacks, localeIds)
}
