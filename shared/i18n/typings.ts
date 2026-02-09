export interface Translation {
    key: string
    t: string
    tHtml?: string
    tClean?: string
}

/**
 * Locale definition, optionally including strings
 */
export interface Locale {
    id: string
    /**
     * @deprecated Prefer using "LocaleParsed" dict object
     * This is the structure returned by the API but it shouldn't be used after parsing
     */
    strings?: Translation[]
    /**
     * TODO: this value was not present in the type def here but is expected by Popover
     * and LocaleSwitcher
     */
    label?: string
    translators?: Array<string>
    completion?: number
    repo?: string
    translatedCount?: number
    totalCount?: number
}

/**
 * Locale with strings as an array
 * as returned by the API
 */
export type LocaleWithStrings = Locale & Required<Pick<Locale, 'strings'>>
/**
 * Locale with strings as a record,
 * to be used in applications
 */
export type LocaleParsed = Locale & {
    dict: Record<string, Translation>
    /** Contexts used to load the strings */
    contexts?: Array<string>
}

export type ValuesType = Record<string, any>

export interface StringTranslator {
    (key: string, values?: ValuesType, fallback?: string): StringTranslatorResult
}

export interface MultiKeysStringTranslator {
    (
        keys: Array<string | undefined | ((values?: ValuesType) => StringTranslatorResult)>,
        values?: ValuesType,
        fallback?: string
    ): StringTranslatorResult
}

export interface StringTranslatorResult {
    locale: Omit<Locale, 'strings'>
    /**
     * A fallback was used (provided fallback, or token id)
     *
     * NOTE: "t" is usually non-empty, even when missing is "true",
     * since we use fallback strings/token key as fallback
     */
    missing?: boolean
    key?: string
    t: string
    /**
     * If defined, should be used in priority over t
     * Will not be defined if missing="true"
     */
    tHtml?: string
    /**
     * If defined, should be used in priority over t
     * Will not be defined if missing="true"
     * <form foo="bar"> clean version would be 'form foo="bar"', useful eg for tooltips
     */
    tClean?: string
    /**
     * Fallback string
     * If you want to use a React component as fallback,
     * implement it at framework level
     */
    fallback?: string
}
