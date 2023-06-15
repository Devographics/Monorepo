import {
    Locale,
    LocaleRawData,
    LocaleMetaData,
    RequestContext,
    StringFile,
    TranslationStringObject
} from './types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import localesYAML from './data/locales.yml'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last.js'
import { setCache } from './caching'
import marked from 'marked'
import {
    flattenStringFiles,
    getLocaleRawContextCacheKey,
    getLocaleParsedContextCacheKey,
    getLocaleUntranslatedKeysCacheKey,
    getAllLocalesMetadataCacheKey,
    allContexts
} from './locales'
import path from 'path'
import sanitizeHtml from 'sanitize-html'
import { decode } from 'html-entities'
import { logToFile } from '@devographics/helpers'

import { appSettings } from './settings'

///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// Data Loading //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

const excludedFiles = ['crowdin.yml']

export const addToAllContexts = (context: string) => {
    if (!allContexts.includes(context)) {
        allContexts.push(context)
    }
}

export const loadAllFromGitHub = async (
    localesToLoad: LocaleMetaData[]
): Promise<LocaleRawData[]> => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    let locales: LocaleRawData[] = []
    let i = 0

    for (const localeMetaData of localesToLoad) {
        const localeRawData: LocaleRawData = { id: localeMetaData.id, stringFiles: [] }
        i++
        const owner = 'devographics'
        const repo = `locale-${localeMetaData.id}`
        console.log(`-> loading repo ${owner}/${repo} (${i}/${localesToLoad.length})`)

        const options = {
            owner,
            repo,
            path: ''
        }

        const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', options)
        const files = contents.data as any[]

        // loop over repo contents and fetch raw yaml files
        for (const file of files) {
            const extension: string = last(file?.name.split('.')) || ''
            if (['yml', 'yaml'].includes(extension) && !excludedFiles.includes(file.name)) {
                const response = await fetch(file.download_url)
                const contents = await response.text()
                try {
                    const yamlContents: any = yaml.load(contents)
                    const strings = yamlContents.translations
                    const context = file.name.replace('./', '').replace('.yml', '')
                    addToAllContexts(context)
                    localeRawData.stringFiles.push({
                        strings,
                        url: file.download_url,
                        context
                    })
                } catch (error) {
                    console.log(`// Error loading file ${file.name}`)
                    console.log(error)
                }
            }
        }
        logToFile(`github_${localeMetaData.id}.yml`, localeRawData, { mode: 'overwrite' })
        locales.push(localeRawData)
    }
    return locales
}

// when developing locally, load from local files
export const loadAllLocally = async (localesToLoad: LocaleMetaData[]): Promise<LocaleRawData[]> => {
    let i = 0
    let locales: LocaleRawData[] = []

    for (const localeMetaData of localesToLoad) {
        const localeRawData: LocaleRawData = { id: localeMetaData.id, stringFiles: [] }
        i++
        const localeDirName = `locale-${localeMetaData.id}`
        console.log(`-> loading directory ${localeDirName} locally (${i}/${localesToLoad.length})`)

        if (!process.env.LOCALES_DIR) {
            throw new Error('LOCALES_DIR not set')
        }
        const localeDirPath = path.resolve(`../../${process.env.LOCALES_DIR}/${localeDirName}`)
        const files = await readdir(localeDirPath)
        const yamlFiles = files.filter((f: String) => f.includes('.yml'))

        // loop over repo contents and fetch raw yaml files
        for (const fileName of yamlFiles) {
            if (!excludedFiles.includes(fileName)) {
                const filePath = localeDirPath + '/' + fileName
                const contents = await readFile(filePath, 'utf8')
                const yamlContents: any = yaml.load(contents)
                const strings = yamlContents.translations
                const context = fileName.replace('./', '').replace('.yml', '')
                addToAllContexts(context)
                localeRawData.stringFiles.push({
                    strings,
                    url: filePath,
                    context
                })
            }
        }
        logToFile(`filesystem_${localeMetaData.id}.yml`, localeRawData, { mode: 'overwrite' })
        locales.push(localeRawData)
    }
    return locales
}

/*

Load the YAML file containing metadata for all locales

*/
export const getLocalesYAML = () => {
    return localesYAML
}

/*

Get metadata for a single locale

*/
export const getLocaleYAML = (localeId: string) => {
    return getLocalesYAML().find((l: Locale) => l.id === localeId)
}

/*

Load locales contents through GitHub API or locally

*/
export const loadLocales = async (localeIds?: string[]): Promise<LocaleRawData[]> => {
    const allLocales = getLocalesYAML()
    const localesToLoad = localeIds
        ? allLocales.filter((locale: LocaleMetaData) => localeIds.includes(locale.id))
        : allLocales
    console.log(
        `// loading ${localesToLoad.length} locales… (${localesToLoad
            .map((l: LocaleMetaData) => l.id)
            .join(',')})`
    )
    const locales =
        appSettings.loadLocalesMode === 'local'
            ? await loadAllLocally(localesToLoad)
            : await loadAllFromGitHub(localesToLoad)
    console.log('// done loading locales')
    return locales
}

/*

Load a single locale

*/
export const loadLocale = async (localeId: string): Promise<LocaleRawData> => {
    const locales = await loadLocales([localeId])
    return locales[0]
}

///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Parsing ////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/*

Resolve aliases

*/
export const resolveAliases = (stringFile: StringFile, localeRawData: LocaleRawData) => {
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
    locale: LocaleRawData,
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

///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Metadata ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

export const computeMetaData = (
    locale: LocaleRawData,
    allStrings: TranslationStringObject[],
    untranslatedKeys: string[]
) => {
    const isEn = locale.id === 'en-US'
    const totalCount = allStrings.length
    const translatedCount = totalCount - untranslatedKeys.length
    const completion = isEn ? 100 : Math.round((translatedCount * 100) / totalCount)
    const repo = `devographics/locale-${locale.id}`
    const dynamicData = {
        totalCount,
        translatedCount,
        completion,
        repo
    }
    const yamlData = getLocaleYAML(locale.id)
    return { ...dynamicData, ...yamlData }
}

export const computeUntranslatedKeys = (
    locale: LocaleRawData,
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

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Caching //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

const STORE_RAW_DATA = false
/**

Init locales by parsing them and then caching them

**/
export const initLocales = async ({ context }: { context: RequestContext }) => {
    const startedAt = new Date()
    const allLocalesMetadata = []
    console.log(`// Initializing locales cache (Redis)…`)
    let i = 0
    const allLocalesRawData = await loadLocales()
    const enLocale = allLocalesRawData.find(l => l.id === 'en-US')
    if (!enLocale) {
        throw Error('en-US not found in loaded locales')
    }

    // parse en-US strings only once outside of main loop to
    // avoid repeating work
    const enParsedStringFiles = enLocale.stringFiles.map((sf: StringFile) => {
        const stringFileWithAliases = resolveAliases(sf, enLocale)
        const stringFileWithMarkdown = parseMarkdown(stringFileWithAliases)
        return stringFileWithMarkdown
    })

    for (const locale of allLocalesRawData) {
        let j = 0
        i++
        console.log(`\n\n// Processing locale ${locale.id} (${i}/${allLocalesRawData.length})`)

        const parsedStringFiles: StringFile[] = []
        // always use en-US as reference to know what to include
        for (const enStringFile of enParsedStringFiles) {
            j++

            const localeStringFile = locale.stringFiles.find(
                (s: StringFile) => s.context === enStringFile.context
            )

            let stringFileWithFallbacks
            if (!localeStringFile) {
                // this context does not exist in the current locale
                // use en-US with every string marked as being a fallback instead
                console.warn(
                    `  !! File for context ${locale.id}/${enStringFile.context} is missing, using en-US/${enStringFile.context} instead.`
                )
                stringFileWithFallbacks = {
                    context: enStringFile.context,
                    strings: enStringFile.strings.map((s: TranslationStringObject) => ({
                        ...s,
                        isFallback: true
                    }))
                }
            } else {
                const rawCacheKey = getLocaleRawContextCacheKey({
                    localeId: locale.id,
                    context: localeStringFile.context
                })

                if (STORE_RAW_DATA && localeStringFile) {
                    // store raw data
                    setCache(rawCacheKey, localeStringFile, context)
                    console.log(`-> Done caching raw locale (${rawCacheKey})`)
                }

                // this context does exist, go through parsing process
                const stringFileWithAliases = resolveAliases(localeStringFile, locale)
                const stringFileWithMarkdown = parseMarkdown(stringFileWithAliases)
                stringFileWithFallbacks = addFallbacks(stringFileWithMarkdown, locale, enStringFile)
            }
            parsedStringFiles.push(stringFileWithFallbacks)
            const parsedCacheKey = getLocaleParsedContextCacheKey({
                localeId: locale.id,
                context: enStringFile.context
            })
            setCache(parsedCacheKey, stringFileWithFallbacks, context)
            console.log(
                `-> Done caching locale file ${parsedCacheKey} (${j}/${enParsedStringFiles.length})`
            )
        }

        const allStrings: TranslationStringObject[] = flattenStringFiles(parsedStringFiles)

        const untranslatedKeys = computeUntranslatedKeys(locale, allStrings)
        allLocalesMetadata.push(computeMetaData(locale, allStrings, untranslatedKeys))
        // store untranslated keys
        setCache(getLocaleUntranslatedKeysCacheKey(locale.id), untranslatedKeys, context)
        console.log(
            `-> Done caching untranslated keys ${getLocaleUntranslatedKeysCacheKey(locale.id)}`
        )
    }

    // store metadata for all locales
    setCache(getAllLocalesMetadataCacheKey(), allLocalesMetadata, context)
    console.log(`-> Done caching list of all locales (${getAllLocalesMetadataCacheKey()})`)

    const finishedAt = new Date()
    console.log(
        `=> Locales cache initialization done in ${finishedAt.getTime() - startedAt.getTime()}ms.`
    )
}
