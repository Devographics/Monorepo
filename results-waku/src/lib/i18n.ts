type Translation = {
  key: string
  t: string
  tHtml?: string
  tClean?: string
}

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

type LocaleParsed = Omit<LocaleWithStrings, 'strings'> & {
  strings: Translation[]
  dict: Record<string, Translation>
  contexts: string[]
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
    .map((item) => item.trim())
    .filter(Boolean)

const getApiUrl = () => {
  const apiUrl = process.env.API_URL || process.env.GATSBY_API_URL
  if (!apiUrl) {
    throw new Error('Missing API_URL (or GATSBY_API_URL)')
  }
  return apiUrl
}

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

const createLocaleQuery = (localeId: string, contexts: string[]) => `
query {
  locale(localeId: ${toEnumValue(localeId)}, contexts: [${contexts.join(', ')}]) {
    id
    completion
    label
    repo
    totalCount
    translatedCount
    translators
    strings {
      key
      t
      tHtml
      tClean
    }
  }
}
`

const createLocalesQuery = () => `
query {
  locales {
    id
    label
    completion
    translators
  }
}
`

const runGraphql = async <T>(query: string): Promise<T> => {
  const response = await fetch(getApiUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ query, variables: {} }),
  })

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as {
    data?: T
    errors?: Array<{ message: string }>
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join('\n'))
  }

  if (!json.data) {
    throw new Error('GraphQL response did not contain data')
  }

  return json.data
}

const parseLocale = (localeWithStrings: LocaleWithStrings, contexts: string[]): LocaleParsed => {
  const dict: Record<string, Translation> = {}
  for (const translation of localeWithStrings.strings) {
    dict[translation.key] = translation
  }
  return {
    ...localeWithStrings,
    dict,
    contexts,
  }
}

const createEmptyLocale = (localeId: string, contexts: string[]): LocaleParsed => ({
  id: localeId,
  label: localeId,
  completion: 0,
  translators: [],
  strings: [],
  dict: {},
  contexts,
})

const fetchLocale = async (localeId: string, contexts: string[]) => {
  const cacheKey = `${localeId}::${contexts.join(',')}`
  const cached = localeDictCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const data = await runGraphql<LocaleQueryResult>(createLocaleQuery(localeId, contexts))
  if (!data.locale) {
    throw new Error(`Locale "${localeId}" not found`)
  }

  const parsedLocale = parseLocale(data.locale, contexts)
  localeDictCache.set(cacheKey, parsedLocale)
  return parsedLocale
}

const fetchLocales = async () => {
  if (localesCache) {
    return localesCache
  }
  const data = await runGraphql<LocalesQueryResult>(createLocalesQuery())
  localesCache = data.locales || []
  return localesCache
}

export const getAllLocales = async () => {
  const locales = await fetchLocales()
  return locales.filter((locale) => locale.active !== false)
}

export const loadLocaleWithFallback = async (requestedLocaleId: string): Promise<LocaleLoadResult> => {
  const contexts = getTranslationContexts()
  const fallbackLocaleId = getFallbackLocaleId()
  try {
    const locale = await fetchLocale(requestedLocaleId, contexts)
    return {
      locale,
      requestedLocaleId,
      resolvedLocaleId: requestedLocaleId,
      fallbackUsed: false,
    }
  } catch (error) {
    const primaryError = error instanceof Error ? error.message : 'unknown error'
    try {
      const fallbackLocale = await fetchLocale(fallbackLocaleId, contexts)
      return {
        locale: fallbackLocale,
        requestedLocaleId,
        resolvedLocaleId: fallbackLocaleId,
        fallbackUsed: true,
        fallbackReason: primaryError,
      }
    } catch (fallbackError) {
      const fallbackErrorMessage =
        fallbackError instanceof Error ? fallbackError.message : 'unknown fallback error'
      return {
        locale: createEmptyLocale(fallbackLocaleId, contexts),
        requestedLocaleId,
        resolvedLocaleId: fallbackLocaleId,
        fallbackUsed: true,
        fallbackReason: `${primaryError}; fallback failed: ${fallbackErrorMessage}`,
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
        missing: true,
      }
    }
    return {
      ...message,
      key,
      missing: false,
    }
  }

  const t = (key: string, fallback = '') => getMessage(key, fallback).t

  return { getMessage, t }
}
