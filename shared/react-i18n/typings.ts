// TODO: move those types to "shared" and have surveyform to use them
export interface Translation {
    key: string
    t: string
}

/**
 * Locale definition, optionally including strings
 * TODO: having every field optional is probably wrong
 */
export interface Locale {
    id?: string
    strings?: Translation[]
    /**
     * TODO: this value was not present in the type def here but is expected by Popover
     */
    label?: string
}

interface InterpolationValues {
    values?: { [key: string]: string | number }
}

export interface LegacyTranslator {
    (key: string, interpolation?: InterpolationValues, fallback?: string): string
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
