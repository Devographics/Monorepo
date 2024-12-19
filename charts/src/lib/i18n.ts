import { StringTranslator, StringTranslatorResult, Translation } from '@/i18n/typings'
import { Locale } from '@devographics/types'
import template from 'lodash/template.js'

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

export const applyTemplate = ({
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
        return template(t, { interpolate: /{([\s\S]+?)}/g })(values);
    } catch (error) {
        console.error(error)
        return `[${locale.id}][ERR] ${key}`
    }
}

export const getStringTranslator =
    (locale: Locale): StringTranslator =>
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
            result.t = values ? applyTemplate({ t: result.t, values, locale, key }) : result.t
            result.tClean = values
                ? applyTemplate({ t: result.tClean, values, locale, key })
                : result.tClean
            result.tHtml = values
                ? applyTemplate({ t: result.tHtml, values, locale, key })
                : result.tHtml
        }

        return result
    }
