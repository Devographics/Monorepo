import { Locale, RequestContext } from '../types'
import {
    getLocaleStrings,
    LocaleWithExtraProps,
    getLocaleUntranslatedKeysCacheKey
} from '../locales'
import { getCache } from '../caching'

export default {
    Locale: {
        strings: async (locale: LocaleWithExtraProps, args: any, context: RequestContext) => {
            const { id, contexts } = locale
            const strings = await getLocaleStrings(id, contexts, context)
            return strings
        },
        untranslatedKeys: async (
            locale: LocaleWithExtraProps,
            args: any,
            context: RequestContext
        ) => {
            const untranslatedKeys = await getCache(
                getLocaleUntranslatedKeysCacheKey(locale.id),
                context
            )
            return untranslatedKeys
        }
    }
}
