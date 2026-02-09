/** Function that actually translates a string */
import template from 'lodash/template.js'
import type {
    Locale,
    Translation,
    StringTranslator,
    StringTranslatorResult,
    LocaleParsed,
    MultiKeysStringTranslator
} from './typings'

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
        // note: console.error() crashes Gatsby build on render.com
        // console.error(error)
        return `[${locale.id}][ERR] ${key}`
    }
}

/**
 * @deprecated Use makeTranslationFunction with a parsed locale using a dictionary of translations
 */
export const makeTranslatorFunc =
    (locale: Locale) /*: StringTranslator*/ =>
    // TODO: here optimize the strings to use Map instead of navigating an array which will be super slow
    (key: string, { values }: Record<string, any> = {}, fallback?: string) => {
        const { strings = [], ...rest } = locale
        let result: Partial<StringTranslatorResult> = { key, locale: rest }

        const stringObject = findString(key, strings)

        if (!key || !stringObject) {
            result.missing = true
            if (fallback) {
                result.t = fallback
            }
        } else {
            result = { ...result, ...stringObject }
        }

        const injectValues = (s: string) =>
            values ? applyTemplate({ t: s, values, locale, key }) : s

        if (result.t) {
            const t = injectValues(result.t)
            result.t = t
            result.tClean = injectValues(result.tClean ?? t)
            result.tHtml = injectValues(result.tHtml ?? t)
        }

        // TODO: this seems consistant with "results" app usage of this function,
        // it returns a string and not the initial value
        //return result
        return result as StringTranslatorResult
    }

/** Matches anything betwen { }, tolerate spaces, allow multiple interpolations */
const INTERPOLATION_REGEX = /{([\s\S]+?)}/g
/**
 * TODO: see the perf impact of computing the templates
 * Precomputing is probably useless, but we could cache computations
 */
function injectValues(str: string, values: Record<string, any>) {
    try {
        return template(str, { interpolate: INTERPOLATION_REGEX })(values)
    } catch (error) {
        console.warn(
            "Couldn't inject values into a string, a value may be missing",
            str,
            values,
            error
        )
        return str
    }
}

/**
 * Generate a translation helper function "t" (and "getMessage")
 * for a given locale
 *
 * It only handle strings, if you want to use a React component as fallback,
 * implement it in your component
 * @param locale
 * @returns
 */
export function makeTranslationFunction(locale: LocaleParsed) {
    /**
     * Get the full translation with metadata, HTML and clean versions
     */
    const getMessage: StringTranslator = (key, values = {}, fallback) => {
        // get the string or template
        let result: StringTranslatorResult = {
            key,
            locale: { id: locale.id, label: locale.label },
            t: fallback || ''
        }
        // backwards-compatibility with locale.strings
        let translation
        // TODO: get rid of this
        if (locale.strings) {
            // add toReversed() to make sure we use the version of the key that
            // appears last in the locale files in case of multiple conflicting keys

            // @ts-ignore
            translation = [...locale.strings].reverse().find(s => s.key === key)
        } else if (locale.dict) {
            translation = locale.dict[key]
        }

        if (!translation) {
            result.missing = true
        } else {
            result = {
                ...result,
                ...translation
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

    // take either i18n keys, or functions that return a message
    const getFallbacks: MultiKeysStringTranslator = (keys, values, fallback) => {
        let message: StringTranslatorResult
        // look at each key and return the first hit we get
        for (const keyOrFunction of keys) {
            if (keyOrFunction) {
                if (typeof keyOrFunction === 'function') {
                    message = keyOrFunction(values)
                } else {
                    message = getMessage(keyOrFunction, values)
                }
                if (message?.t && !message?.missing) {
                    return message
                }
            }
        }
        // if there are no hits for any of the keys
        const defaultKey = keys.filter(k => typeof k === 'string')[0]
        const defaultResult = {
            t: fallback || defaultKey,
            locale,
            missing: true
        }
        return defaultResult
    }

    /**
     * Shortcut to get a translated string
     *
     * Prefer "getMessage" for more elaborate usage (HTML content, handling missing values...)
     */
    function t(key: string, values: Record<string, any> = {}, fallback?: string) {
        let result = locale.dict[key]?.t || fallback || ''
        result = injectValues(result, values)
        return result
    }
    return { t, getMessage, getFallbacks }
}
