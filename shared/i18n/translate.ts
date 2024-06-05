/** Function that actually translates a string */
import template from 'lodash/template.js'
import type {
    Locale,
    Translation,
    StringTranslator,
    StringTranslatorResult,
    LocaleParsed
} from "./typings"

const findString = (key: string, strings: Translation[]) => {
    // reverse strings so that strings added last take priority
    return strings
        .slice()
        .reverse()
        .find(t => t.key === key)
}

/**
 * "Hello {foobar }", {foobar: "world"} => "hello world"
 */
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
        // Detect any text within {}
        return template(t, { interpolate: /{([\s\S]+?)}/g })(values)
    } catch (error) {
        console.error(error)
        return `[${locale.id}][ERR] ${key}`
    }
}

/**
 * @deprecated Use makeTranslationFunction with a parsed locale using a dictionary of translations
 */
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


/** Matches anything betwen { }, tolerate spaces, allow multiple interpolations */
const INTERPOLATION_REGEX = /{([\s\S]+?)}/g
/**
 * TODO: see the perf impact of computing the templates
 * Precomputing is probably useless, but we could cache computations
 */
function injectValues(str: string, values: Record<string, any>) {
    return template(str, { interpolate: INTERPOLATION_REGEX })(values)
}

/**
 * Generate a translation helper function "t" (and "getMessage")
 * for a given locale
 * @param locale 
 * @returns 
 */
export function makeTranslationFunction(locale: LocaleParsed) {

    /**
     * Get the full translation with metadata, HTML and clean versions
     */
    function getMessage(key: string, values: Record<string, any> = {}, fallback?: string) {
        // get the string or template
        let result: StringTranslatorResult = {
            key,
            locale: { id: locale.id, label: locale.label },
            t: fallback || ""
        }
        const translation = locale.dict[key]
        if (!translation) {
            result.missing = true
        } else {
            result = {
                ...result,
                ...translation,
            }
        }
        // interpolate values
        const t = injectValues(result.t, values)
        // handle tClean and tHTML variations
        result.t = t
        result.tClean = result.tClean ? injectValues(result.tClean, values) : result.t
        result.tHtml = result.tHtml ? injectValues(result.tHtml, values) : result.t
        return result as StringTranslatorResult
    }
    /**
     * Shortcut to get a translated string
     * 
     * Prefer "getMessage" for more elaborate usage (HTML content, handling missing values...)
     */
    function t(key: string, values: Record<string, any> = {}, fallback?: string) {
        let result = locale.dict[key]?.t || fallback || ""
        result = injectValues(result, values)
        return result

    }
    return { t, getMessage }
}