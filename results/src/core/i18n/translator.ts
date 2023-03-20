import template from 'lodash/template.js'
import {
    Locale,
    Translation,
    LegacyTranslator,
    StringTranslator,
    StringTranslatorResult
} from '@types/index'
/*

Returns the translation string object

*/
const findString = (key: string, strings: Translation[]) => {
    // reverse strings so that strings added last take priority
    return strings
        .slice()
        .reverse()
        .find(t => t.key === key)
}

export const applyTemplate = (
    t: string,
    values: { [key: string]: string },
    locale: Locale,
    key: string
) => {
    try {
        return template(t, { interpolate: /{([\s\S]+?)}/g })(values)
    } catch (error) {
        console.error(error)
        return `[${locale.id}][ERR] ${key}`
    }
}

export const getStringTranslator =
    (locale: Locale = {}): StringTranslator =>
    (key, { values } = {}, fallback) => {
        const { strings = [], ...rest } = locale
        let result: StringTranslatorResult = { key, locale: rest }

        const stringObject = findString(key, strings)

        if (stringObject) {
            result = { ...result, ...stringObject }
        } else {
            result.missing = true
            if (fallback) {
                result.t = fallback
            }
        }

        if (result.t) {
            result.t = values ? applyTemplate(result.t, values, locale, key) : result.t
            result.tHtml = values ? applyTemplate(result.tHtml, values, locale, key) : result.tHtml
        }

        return result
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
            .find(t => t.key === key)

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
