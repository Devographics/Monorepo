/*

Raw locale data as loaded from GitHub or local filesystem

*/
export interface LocaleRawData {
    id: string
    stringFiles: StringFile[]
}

/*

Locale metadata stored in locales.yml

*/
export interface LocaleMetaData {
    id: string
    label: string
    translators?: string[]
    repo: string
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
    strings?: TranslationStringObject[]
    translators?: string[]
    repo?: string
    translatedCount?: number
    totalCount?: number
    completion?: number
    untranslatedKeys?: string[]
}

export interface StringFile {
    strings: TranslationStringObject[]
    context: string
    url?: string
}

export interface TranslationStringObject {
    key: string
    t: string
    tHtml?: string
    context?: string
    isFallback: Boolean
    aliasFor?: string
}
