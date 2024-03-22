/** Function that actually translates a string */
import template from 'lodash/template.js'
import type {
    Locale,
    Translation,
    StringTranslator,
    StringTranslatorResult
} from "./typings"

const findString = (key: string, strings: Translation[]) => {
    // reverse strings so that strings added last take priority
    return strings
        .slice()
        .reverse()
        .find(t => t.key === key)
}

const applyTemplate = ({
    t,
    values,
    locale,
    key
}: {
    t?: string
    values: { [key: string]: string | number }
    locale: Locale
    key: string
}) => {
    try {
        return template(t, { interpolate: /{([\s\S]+?)}/g })(values)
    } catch (error) {
        console.error(error)
        return `[${locale.id}][ERR] ${key}`
    }
}

// TODO: this seems super slow?
export const makeTranslatorFunc =
    (locale: Locale): StringTranslator =>
        // TODO: here optimize the strings to use Map instead of navigating an array which will be super slow
        (key, { values } = {}, fallback) => {
            const { strings = [], ...rest } = locale
            let result: Partial<StringTranslatorResult> = { key, locale: rest }

            const stringObject = findString(key, strings)

            if (stringObject) {
                result = { ...result, ...stringObject }
            } else {
                result.missing = true
                if (fallback) {
                    result.t = fallback
                }
            }

            const injectValues = (s: string) =>
                values ? applyTemplate({ t: s, values, locale, key }) : s

            if (result.t) {
                const t = injectValues(result.t)
                result.t = t
                result.tClean = injectValues(result.tClean ?? t)
                result.tHtml = injectValues(result.tHtml ?? t)
            }

            return result as StringTranslatorResult
        }