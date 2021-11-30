import template from 'lodash/template'

interface Translation {
    key: string
    t: string
}

export interface Locale {
    id?: string
    strings?: Translation[]
}

interface InterpolationValues {
    values?: { [key: string]: string }
}

export interface LegacyTranslator {
    (key: string, interpolation: InterpolationValues, fallback?: string): string
}

export interface StringTranslator {
    (key: string, interpolation: InterpolationValues, fallback?: string): StringTranslatorResult
}

interface StringTranslatorResult {
    locale: Omit<Locale, 'strings'>
    missing?: boolean
    key?: string
    t?: string
}

/*

Returns the translation string object

*/
const findString = (key: string, strings: Translation[]) => {
    // reverse strings so that strings added last take priority
    return strings
        .slice()
        .reverse()
        .find((t) => t.key === key)
}

export const getStringTranslator =
    (locale: Locale = {}): StringTranslator =>
    (key, { values } = {}, fallback) => {
        const { strings = [], ...rest } = locale
        const result: StringTranslatorResult = { locale: rest }

        let s = findString(key, strings)

        if (!s) {
            result.missing = true
            if (fallback) {
                s = { key, t: fallback }
            }
        }

        if (s && values) {
            try {
                s.t = template(s.t, { interpolate: /{([\s\S]+?)}/g })(values)
            } catch (error) {
                console.error(error)
                s.t = `[${locale.id}][ERR] ${key}`
            }
        }

        return { ...result, ...s }
    }

/*

Returns the translated string (legacy)

*/
export const getTranslator =
    (locale: Locale = {}): LegacyTranslator =>
    (key, { values } = {}, fallback) => {
        const { id, strings = [] } = locale
        // reverse strings so that strings added last take priority
        const translation = strings
            .slice()
            .reverse()
            .find((t) => t.key === key)

        if (translation === undefined) {
            return typeof fallback === 'undefined' ? `[${id}] ${key}` : fallback
        }

        if (values === undefined) return translation.t

        try {
            return template(translation.t, { interpolate: /{([\s\S]+?)}/g })(values)
        } catch (error) {
            // console.error(error)
            return `[${id}][ERR] ${key}`
        }
    }

export const translateOrFallback = (translatedKey: string, fallback: string) =>
    translatedKey.match(/\[[a-z]{2}-[A-Z]{2}?\] [a-z_\-.]+/) ? fallback : translatedKey
