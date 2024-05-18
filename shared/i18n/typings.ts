export interface Translation {
    key: string
    t: string
}

/**
 * Locale definition, optionally including strings
 */
export interface Locale {
    id: string
    // TODO: remove this to clarify LocaleDefinition, LocaleStrings, LocaleParsed as dict
    strings?: Translation[]
    /**
     * TODO: this value was not present in the type def here but is expected by Popover
     */
    label?: string
}
/**
 * Locale with strings as an array
 * as returned by the API
 */
export type LocaleWithStrings = Locale & Required<Pick<Locale, "strings">>
/**
 * Locale with strings as a record,
 * to be used in applications
 */
export type LocaleParsed = Locale & { dict: Record<string, Translation> }

interface InterpolationValues {
    values?: { [key: string]: string | number }
}

export interface StringTranslator {
    (key: string, interpolation?: InterpolationValues, fallback?: string): StringTranslatorResult
}

export interface StringTranslatorResult {
    locale: Omit<Locale, 'strings'>
    missing?: boolean
    key?: string
    t: string
    tHtml?: string
    /** <form foo="bar"> clean version would be 'form foo="bar"', useful eg for tooltips */
    tClean?: string
    fallback?: string
}
