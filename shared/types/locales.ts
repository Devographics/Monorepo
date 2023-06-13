/**
 * As returned by the translation API
 */
export interface RawLocale {
    id: string
    label?: string
    dynamic?: boolean
    translators?: Array<string>
    completion?: number
    repo?: string
    translatedCount?: number
    totalCount?: number
    /**
     * Loading strings is costly! Use only when necessary
     */
    stringFiles: Array<StringFile>
}

export interface StringFile {
    strings: TranslationStringObject[]
    context: string
    url?: string
}

export type LocaleDef = Omit<RawLocale, 'strings'>
export type LocaleDefWithStrings = Omit<RawLocale, 'strings'> & {
    /**
     * Strings as a map
     */
    strings: { [id: string]: string }
}

/*

Locale metadata stored in locales.yml

*/
export interface LocaleMetaData {
    id: string
    label: string
    translators?: string[]
}

/*

Locale metadata computed on the fly

*/
export interface LocaleDynamicMetaData {
    translatedCount: number
    totalCount: number
    completion: number
    untranslatedKeys: string[]
}

/*

Full locale data

*/
export interface Locale {
    id: string
    label?: string
    strings: TranslationStringObject[]
    translators?: string[]
    repo?: string
    translatedCount?: number
    totalCount?: number
    completion?: number
    untranslatedKeys?: string[]
}
export interface TranslationStringObject {
    key: string
    t: string
    tHtml?: string
    tClean?: string
    context: string
    isFallback: Boolean
    aliasFor?: string
}
