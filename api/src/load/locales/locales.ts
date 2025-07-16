import { Locale, RawLocale } from '@devographics/types'
import { EnvVar, getEnvVar, parseEnvVariableArray } from '@devographics/helpers'

import { RequestContext } from '../../types'
import {
    getLocaleDiff,
    initLocaleReport,
    logLocaleReport,
    processLocales
} from '../../helpers/locales'
import { loadAllLocally } from './local'
import { loadAllFromGitHub } from './github'

let RawLocales: RawLocale[] = []
let Locales: Locale[] = []

export const allContexts: string[] = []
export const excludedFiles = ['config.yml', 'crowdin.yml', 'legacy.yml', 'yaml-lint-config.yml']

export const addToAllContexts = (context: string) => {
    if (!allContexts.includes(context)) {
        allContexts.push(context)
    }
}

export const getAllContexts = () => {
    return allContexts
}

export interface LoadAllOptions {
    localeIds?: string[]
    localeContexts?: string[]
}

export const mergeLocales = (locale1: RawLocale, locale2: RawLocale) => {
    return {
        ...locale1,
        translators: [...locale1.translators, ...locale2.translators],
        stringFiles: [...locale1.stringFiles, ...locale2.stringFiles]
    }
}
/*

Load the YAML file containing metadata for all locales

*/
// export const getLocalesMetadataYAML = (): LocaleMetaData[] => {
//     return localesYAML
// }

/* 

Load locales if not yet loaded

*/
export const loadOrGetLocales = async (
    options: { context?: RequestContext; forceReload?: boolean; localeIds?: string[] } = {
        forceReload: false
    }
): Promise<Array<Locale>> => {
    const { forceReload, context } = options || {}
    const localeIds = options.localeIds || getLocaleIds()
    const localeContexts = getLocaleContexts()
    if (forceReload || Locales.length === 0) {
        const rawLocales = await loadLocales(localeIds, localeContexts)
        RawLocales = rawLocales
        const rawEnLocale = rawLocales.find(l => l.id === 'en-US')
        if (!rawEnLocale) {
            throw Error('loadOrGetLocales: en-US not found in loaded locales')
        }
        Locales = processLocales({ rawLocales, rawEnLocale })
        if (context) {
            context.locales = Locales
        }
    }
    return Locales
}

export const initLocales = async ({
    context,
    localeIds
}: {
    context: RequestContext
    localeIds?: string[]
}) => {
    const locales = await loadOrGetLocales({ context, forceReload: true, localeIds })
    Locales = locales
}

export const reloadLocale = async ({
    localeId,
    context
}: {
    localeId: string
    context?: RequestContext
}) => {
    const currentLocale = Locales.find(l => l.id === localeId)!
    const rawEnLocale = RawLocales.find(l => l.id === 'en-US')
    if (!rawEnLocale) {
        throw Error('reloadLocale: en-US not found in loaded locales')
    }
    const rawLocales = await loadLocales([localeId])
    const processedLocales = processLocales({ rawLocales, rawEnLocale })
    const reloadedLocale = processedLocales[0]
    // get diff to figure out which strings were added/modified
    const localeDiff = getLocaleDiff(currentLocale, reloadedLocale)
    // update Locales global object
    const localeIndex = Locales.findIndex(l => l.id === localeId)
    Locales = Locales.with(localeIndex, reloadedLocale)
    return { reloadedLocale, localeDiff }
}

export const getLocalesLoadMethod = () => (getEnvVar(EnvVar.LOCALES_PATH) ? 'local' : 'github')

export const getLocaleIds = () => {
    const enableFastBuild = process.env.FAST_BUILD === 'true'
    const envLocaleIds = parseEnvVariableArray(getEnvVar(EnvVar.LOCALE_IDS))
    const localeIds = enableFastBuild ? ['en-US', 'ru-RU', 'es-ES', 'ua-UA'] : envLocaleIds || []
    return localeIds
}

export const getLocaleContexts = () => {
    return parseEnvVariableArray(getEnvVar(EnvVar.LOCALE_CONTEXTS))
}
/*

Load locales contents through GitHub API or locally

*/
export const loadLocales = async (
    localeIds: string[] = [],
    localeContexts: string[] = []
): Promise<RawLocale[]> => {
    const mode = getLocalesLoadMethod()
    console.log(
        `🌐 loading locales… (mode: ${mode} ${
            localeIds.length > 0 ? `; localeIds: ${localeIds.join(', ')}` : ''
        }${localeContexts.length > 0 ? `; localeContexts: ${localeContexts.join(', ')}` : ''})`
    )
    const locales =
        mode === 'local'
            ? await loadAllLocally({ localeIds, localeContexts })
            : await loadAllFromGitHub({ localeIds, localeContexts })
    console.log('🌐 done loading locales')
    return locales
}
