import { Locale, RawLocale } from '@devographics/types'
import { EnvVar, getEnvVar, parseEnvVariableArray } from '@devographics/helpers'

import { RequestContext } from '../../types'
import { processLocales } from '../../helpers/locales'
import { loadAllLocally } from './local'
import { loadAllFromGitHub } from './github'

let Locales: Locale[] = []

export const allContexts: string[] = []
export const excludedFiles = ['config.yml', 'crowdin.yml', 'legacy.yml']

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
    options: { forceReload?: boolean } = { forceReload: false },
    context?: RequestContext
): Promise<Array<Locale>> => {
    const { forceReload } = options
    const localeIds = getLocaleIds()
    const contextsIds = getContextsIds()
    if (forceReload || Locales.length === 0) {
        const rawLocales = await loadLocales(localeIds, contextsIds)
        Locales = processLocales(rawLocales)
        if (context) {
            context.locales = Locales
        }
    }
    return Locales
}

export const initLocales = async () => {
    const locales = await loadOrGetLocales({ forceReload: true })
    Locales = locales
}

export const getLocalesLoadMethod = () => (getEnvVar(EnvVar.LOCALES_PATH) ? 'local' : 'github')

export const getLocaleIds = () => {
    const enableFastBuild = process.env.FAST_BUILD === 'true'
    const envLocaleIds = parseEnvVariableArray(getEnvVar(EnvVar.LOCALE_IDS))
    const localeIds = enableFastBuild ? ['en-US', 'ru-RU'] : envLocaleIds || []
    return localeIds
}

export const getContextsIds = () => {
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
