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
    strings?: Array<{ key: string; t: string; tHtml?: string }>
}

export type LocaleDef = Omit<RawLocale, 'strings'>
export type LocaleDefWithStrings = Omit<RawLocale, 'strings'> & {
    /**
     * Strings as a map
     */
    strings: { [id: string]: string }
}
