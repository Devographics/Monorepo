import { RequestContext } from '../types'
import { filterContexts } from '../helpers/locales'
import { Locale } from '@devographics/types'
import { loadOrGetLocales } from '../load/locales'

/*

Get a specific locale object (strings get their own separate resolver)

*/
export interface LocaleWithExtraProps extends Locale {
    contexts?: string[]
}

const convert = (localeId: string) => localeId.replace('_', '-')

export const localesResolvers = {
    locale: async (
        root: any,
        { localeId, contexts }: { localeId: string; contexts: string[] },
        context: RequestContext
    ) => {
        console.log('// locale resolver')
        return await getLocale({ localeId: convert(localeId), contexts, context })
    },
    locales: async (
        root: any,
        { localeIds, contexts }: { localeIds: string[]; contexts: string[] },
        context: RequestContext
    ) => {
        return await getLocales({ localeIds: localeIds?.map(convert), contexts, context })
    },
    translation: async (
        root: any,
        { key, localeId }: { localeId: string; key: string },
        context: RequestContext
    ) => {
        return await getTranslation({ localeId: convert(localeId), key, context })
    }
}

export const getLocale = async ({
    localeId,
    contexts,
    enableFallbacks = true,
    context
}: {
    localeId: string
    contexts?: string[]
    enableFallbacks?: boolean
    context: RequestContext
}): Promise<LocaleWithExtraProps> => {
    const allLocales = await loadOrGetLocales()
    let locale = allLocales.find(l => l.id === localeId)
    if (!locale) {
        throw new Error(`getLocale error: could not find locale with id ${localeId}`)
    }
    if (contexts) {
        locale = filterContexts({ locale, contexts })
    }
    return locale
}

/*

Get multiple locales

*/
export const getLocales = async ({
    localeIds,
    contexts
}: {
    contexts?: string[]
    enableFallbacks?: boolean
    localeIds?: string[]
    context: RequestContext
}): Promise<Array<Locale>> => {
    let locales = await loadOrGetLocales()
    if (localeIds) {
        locales = locales.filter(locale => localeIds.includes(locale.id))
    }
    if (contexts) {
        locales = locales.map(locale => filterContexts({ locale, contexts }))
    }
    return locales
}

/*

Get a specific translation

Reverse array first so that strings added last take priority

*/
export const getTranslation = async ({
    key,
    localeId,
    context
}: {
    key: string
    localeId: string
    context: RequestContext
}) => {
    const locales = await loadOrGetLocales()
    const locale = locales.find(l => l.id === localeId)
    if (!locale) {
        throw new Error(`getTranslation error: could not find locale with id ${localeId}`)
    }
    return locale.strings?.reverse().find((s: any) => s.key === key)
}
