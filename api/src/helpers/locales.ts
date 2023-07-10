import { Locale, RawLocale, StringFile, TranslationStringObject } from '@devographics/types'
import marked from 'marked'
import sanitizeHtml from 'sanitize-html'
import { decode } from 'html-entities'
import { logToFile } from '@devographics/helpers'

export const filterContexts = ({ locale, contexts }: { locale: Locale; contexts: string[] }) => {
    return { ...locale, strings: locale.strings.filter(s => contexts.includes(s.context)) }
}

/*

Resolve aliases

*/
export const resolveAliases = (stringFile: StringFile, localeRawData: RawLocale) => {
    stringFile.strings = stringFile.strings.map((s: TranslationStringObject) => {
        // resolve alias
        if (s.aliasFor) {
            // look through all stringFiles to find the "real" string being aliased
            let realString
            for (const sf of localeRawData.stringFiles) {
                const rs = sf.strings.find((ss: TranslationStringObject) => ss.key === s.aliasFor)
                if (rs) {
                    realString = rs
                    break
                }
            }
            if (realString) {
                s = { ...realString, key: s.key, aliasFor: s.aliasFor }
            }
        }
        return s
    })
    return stringFile
}

/*

Parse a string file and add parsed markdown versions where needed

*/
export const parseMarkdown = (stringFile: StringFile) => {
    stringFile.strings = stringFile.strings.map((s: TranslationStringObject) => {
        const str = String(s.t).trim()
        s.t = str
        // if string contains line breaks parse it as paragraph, else parse it inline
        const containsLineBreaks = (str.match(/\n/g) || []).length > 0
        let tHtml = containsLineBreaks ? marked.parse(str) : marked.parseInline(str)
        // we don't actually want to replace quotes or brackets
        tHtml = tHtml.replaceAll('&#39;', `'`)
        tHtml = tHtml.replaceAll('%7B', `{`)
        tHtml = tHtml.replaceAll('%7D', `}`)
        const containsTagRegex = new RegExp(/(<([^>]+)>)/i)
        // if markdown-parsed version of the string is different from original,
        // or original contains one or more HTML tags, add it as HTML
        if (tHtml !== s.t || containsTagRegex.test(s.t)) {
            s.tHtml = sanitizeHtml(tHtml, {
                allowedClasses: {
                    '*': ['*']
                }
            })
            s.tClean = decode(
                sanitizeHtml(tHtml, {
                    allowedTags: []
                })
            )
        }
        return s
    })
    return stringFile
}

export const addFallbacks = (
    stringFile: StringFile,
    locale: RawLocale,
    enStringFile: StringFile
) => {
    const localeStrings = stringFile.strings
    if (locale.id === 'en-US') {
        return stringFile
    } else {
        enStringFile.strings.forEach((enTranslation: TranslationStringObject) => {
            // note: exclude fallback strings that might have been added during
            // a previous iteration of the current loop
            const localeTranslationIndex = localeStrings.findIndex(
                t => t.key === enTranslation.key && !t.isFallback
            )
            const localeString = localeStrings[localeTranslationIndex]
            if (
                localeTranslationIndex === -1 ||
                localeString.t === enTranslation.t ||
                (localeString.t && localeString.t.trim() === 'TODO')
            ) {
                // en-US key doesn't exist in current locale file
                // OR current locale file's translation is same as en-US (untranslated)
                // OR is "TODO"
                localeStrings.push({
                    ...enTranslation,
                    isFallback: true
                })
            } else {
                localeString.isFallback = false
            }
        })
        return stringFile
    }
}

/*

Flatten an array of stringfiles into a single array of strings with context

*/
export const flattenStringFiles = (
    stringFiles: StringFile[],
    addContext: boolean = false
): TranslationStringObject[] => {
    // flatten all stringFiles together
    const stringObjects = stringFiles
        .map((sf: StringFile) => {
            let { strings, context } = sf
            if (strings === null) {
                return []
            }
            if (addContext) {
                // add context to all strings
                strings = strings.map((s: TranslationStringObject) => ({ ...s, context }))
            }
            return strings
        })
        .flat()

    return stringObjects
}

export const addLocaleMetadata = (locale: Locale, untranslatedKeys: string[]): Locale => {
    const isEn = locale.id === 'en-US'
    const totalCount = locale.strings.length
    const translatedCount = totalCount - untranslatedKeys.length
    const completion = isEn ? 100 : Math.round((translatedCount * 100) / totalCount)
    const repo = `devographics/locale-${locale.id}`
    const dynamicData = {
        totalCount,
        translatedCount,
        completion,
        repo
    }
    return { ...locale, ...dynamicData }
}

export const computeUntranslatedKeys = (
    locale: RawLocale,
    allStrings: TranslationStringObject[]
) => {
    const isEn = locale.id === 'en-US'
    const untranslatedKeys = isEn
        ? []
        : allStrings
              .filter((s: TranslationStringObject) => s.isFallback)
              .map((s: TranslationStringObject) => s.key)
    return untranslatedKeys
}

/*

Take a single string file (e.g. the contents of common.yml) and process it

*/
export const processStringFile = ({
    locale,
    stringFile,
    enStringFile
}: {
    locale: RawLocale
    stringFile: StringFile
    enStringFile?: StringFile
}) => {
    let processedStringFile = resolveAliases(stringFile, locale)
    processedStringFile = parseMarkdown(processedStringFile)
    if (enStringFile) {
        processedStringFile = addFallbacks(processedStringFile, locale, enStringFile)
    }
    // add stringFile's context to every one of its strings
    processedStringFile.strings = processedStringFile.strings.map(s => ({
        ...s,
        context: stringFile.context
    }))
    return processedStringFile
}

/*

Take a single locale and process it

*/
export const processLocale = (
    locale: RawLocale,
    enParsedStringFiles: Array<StringFile>
): Locale => {
    const parsedStringFiles: StringFile[] = []
    // always use en-US as reference to know what to include
    for (const enStringFile of enParsedStringFiles) {
        const localeStringFile = locale.stringFiles.find(
            (s: StringFile) => s.context === enStringFile.context
        )

        let stringFile
        if (!localeStringFile) {
            // this context does not exist in the current locale
            // use en-US with every string marked as being a fallback instead
            console.warn(
                `  !! File for context ${locale.id}/${enStringFile.context} is missing, using en-US/${enStringFile.context} instead.`
            )
            stringFile = {
                context: enStringFile.context,
                strings: enStringFile.strings.map((s: TranslationStringObject) => ({
                    ...s,
                    context: enStringFile.context,
                    isFallback: true
                }))
            }
        } else {
            // this context does exist, go through parsing process
            stringFile = processStringFile({ locale, stringFile: localeStringFile, enStringFile })
        }
        parsedStringFiles.push(stringFile)
    }

    const allLocaleStrings: TranslationStringObject[] = flattenStringFiles(parsedStringFiles)

    const { stringFiles, ...localeWithoutStringfiles } = locale
    let processedLocale = { ...localeWithoutStringfiles, strings: allLocaleStrings }

    const untranslatedKeys = computeUntranslatedKeys(locale, processedLocale.strings)
    const processedLocaleWithMetadata = addLocaleMetadata(processedLocale, untranslatedKeys)

    logToFile(`locales_processed/${processedLocale.id}.yml`, processedLocaleWithMetadata)
    return processedLocaleWithMetadata
}

/*

Process all locales

*/
export const processLocales = (allLocalesRawData: Array<RawLocale>): Array<Locale> => {
    const allLocales = []
    let i = 0
    const rawEnLocale = allLocalesRawData.find(l => l.id === 'en-US')
    if (!rawEnLocale) {
        throw Error('en-US not found in loaded locales')
    }

    // parse en-US strings only once outside of main loop to
    // avoid repeating work
    const enParsedStringFiles = rawEnLocale.stringFiles.map((stringFile: StringFile) => {
        return processStringFile({ locale: rawEnLocale, stringFile })
    })

    for (const locale of allLocalesRawData) {
        let j = 0
        i++
        console.log(`\n\n// Processing locale ${locale.id} (${i}/${allLocalesRawData.length})`)
        allLocales.push(processLocale(locale, enParsedStringFiles))
    }
    return allLocales
}
