/**
 * As returned by the translation API
 * @deprecated Migrate towards @devographics/react-i18n based on "results" and shared with surveyform
 */
export interface RawLocale {
    id: string
    label: string
    translators: Array<string>
    // dynamic?: boolean
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
    subDir?: string
    url?: string
}

/**
 * @deprecated Migrate towards @devographics/react-i18n based on "results" and shared with surveyform
 */
export type LocaleDef = Omit<RawLocale, 'strings'>
/**
 * @deprecated Migrate towards @devographics/react-i18n based on "results" and shared with surveyform
 */
export type LocaleDefWithStrings = Omit<RawLocale, 'strings'> & {
    /**
     * Strings as a map
     */
    strings: { [id: string]: string }
}

/*

Locale metadata stored in locales.yml

 * @deprecated Migrate towards @devographics/react-i18n based on "results" and shared with surveyform
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

/**
 * Full locale data
 * @deprecated Migrate towards @devographics/react-i18n based on "results" and shared with surveyform
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
    untranslatedStrings?: TranslationStringObject[]
}
export interface TranslationStringObject {
    key: string
    t: string
    tHtml?: string
    tClean?: string
    context: string
    isFallback: Boolean
    aliasFor?: string
    aliases?: string[]
}
