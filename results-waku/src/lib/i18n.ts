import {
    getAllLocaleDefinitions,
    getLocaleDict,
    type LocaleParsed,
    type Translation
} from '@devographics/i18n/server'

type LocaleWithStrings = {
    id: string
    completion?: number
    label?: string
    repo?: string
    totalCount?: number
    translatedCount?: number
    translators?: string[]
    strings: Translation[]
}

type LocaleMetadata = {
    id: string
    label?: string
    completion?: number
    translators?: string[]
    active?: boolean
}

type LocaleQueryResult = {
    locale: LocaleWithStrings | null
}

type LocalesQueryResult = {
    locales: LocaleMetadata[]
}

type LocaleLoadResult = {
    locale: LocaleParsed
    requestedLocaleId: string
    resolvedLocaleId: string
    fallbackUsed: boolean
    fallbackReason?: string
}

const DEFAULT_LOCALE = 'en-US'
const DEFAULT_SURVEY_ID = 'state_of_js'
const DEFAULT_EDITION_ID = 'js2025'

const localeDictCache = new Map<string, LocaleParsed>()
let localesCache: LocaleMetadata[] | null = null

const toEnumValue = (value: string) => value.replaceAll('-', '_')

const parseEnvArray = (value?: string) =>
    (value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)

export const getSurveyId = () => process.env.SURVEYID || DEFAULT_SURVEY_ID

export const getEditionId = () => process.env.EDITIONID || DEFAULT_EDITION_ID

export const getFallbackLocaleId = () => process.env.I18N_FALLBACK_LOCALE || DEFAULT_LOCALE

export const getTranslationContexts = () => {
    const surveyId = getSurveyId()
    const editionId = getEditionId()
    const baseContexts = ['homepage', 'common', 'results', 'countries']
    const customContexts = parseEnvArray(process.env.CUSTOM_LOCALE_CONTEXTS)
    return [...baseContexts, ...customContexts, surveyId, editionId]
}

const createEmptyLocale = (localeId: string, contexts: string[]): LocaleParsed => ({
    id: localeId,
    label: localeId,
    completion: 0,
    translators: [],
    strings: [],
    dict: {},
    contexts
})

export const getAllLocales = async () => {
    if (localesCache) {
        return localesCache
    }
    const result = await getAllLocaleDefinitions()
    const locales = result.locales || []
    const activeLocales = locales.filter(locale => locale.active !== false)
    localesCache = activeLocales
    return activeLocales
}

export const loadLocaleWithFallback = async (
    requestedLocaleId: string
): Promise<LocaleLoadResult> => {
    const contexts = getTranslationContexts()
    const fallbackLocaleId = getFallbackLocaleId()
    try {
        const { locale, error } = await getLocaleDict({ localeId: requestedLocaleId, contexts })
        if (error || !locale) {
            throw error
        }
        return {
            locale,
            requestedLocaleId,
            resolvedLocaleId: requestedLocaleId,
            fallbackUsed: false
        }
    } catch (error) {
        const primaryError = error instanceof Error ? error.message : 'unknown error'
        try {
            const { locale: fallbackLocale, error } = await getLocaleDict({
                localeId: fallbackLocaleId,
                contexts
            })
            if (error || !fallbackLocale) {
                throw error
            }
            return {
                locale: fallbackLocale,
                requestedLocaleId,
                resolvedLocaleId: fallbackLocaleId,
                fallbackUsed: true,
                fallbackReason: primaryError
            }
        } catch (fallbackError) {
            const fallbackErrorMessage =
                fallbackError instanceof Error ? fallbackError.message : 'unknown fallback error'
            return {
                locale: createEmptyLocale(fallbackLocaleId, contexts),
                requestedLocaleId,
                resolvedLocaleId: fallbackLocaleId,
                fallbackUsed: true,
                fallbackReason: `${primaryError}; fallback failed: ${fallbackErrorMessage}`
            }
        }
    }
}

export const getTranslationHelpers = (locale: LocaleParsed) => {
    const getMessage = (key: string, fallback = '') => {
        const message = locale.dict[key]
        if (!message) {
            return {
                key,
                t: fallback || key,
                missing: true
            }
        }
        return {
            ...message,
            key,
            missing: false
        }
    }

    const t = (key: string, fallback = '') => getMessage(key, fallback).t

    return { getMessage, t }
}
