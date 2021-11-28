export interface Locale {
    id: string
    label: string
    stringFiles: StringFile[]
    translators?: string[]
    repo: string
}

export interface StringFile {
    strings: TranslationStringObject[]
    context: string
    prefix?: string
}

export interface TranslationStringObject {
    key: string
    t: string
    tHtml: string
    context: string
    fallback: Boolean
}
