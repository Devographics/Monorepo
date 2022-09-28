import { Locale, RequestContext } from '../types'
import { getLocaleStrings } from '../locales'

interface LocaleWithContexts extends Locale {
    contexts?: string[]
}

export default {
    Locale: {
        strings: async (locale: LocaleWithContexts, args: any, context: RequestContext) => {
            const { id, contexts } = locale
            const strings = await getLocaleStrings(id, contexts, context)
            return strings
        }
    }
}
