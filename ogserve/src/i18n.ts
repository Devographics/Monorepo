/**
 * Adapted from 
 * results/src/core/types/i18n.ts
 */

export interface Translation {
    key: string
    t: string
}

export interface Locale {
    id?: string
    strings?: Translation[]
}
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
    t?: string
    tHtml?: string
    tClean?: string
    fallback?: string
}