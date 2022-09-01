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
    getLocaleMetaDataCacheKey,
    getAllLocalesListCacheKey
} from './locales'

///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// Data Loading //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const excludedFiles = ['crowdin.yml']

export const loadAllFromGitHub = async (
    localesToLoad: LocaleMetaData[]
): Promise<LocaleRawData[]> => {
    let locales: LocaleRawData[] = []
    let i = 0

    for (const localeMetaData of localesToLoad) {
        const localeRawData: LocaleRawData = { id: localeMetaData.id, stringFiles: [] }
        i++
        console.log(`-> loading repo ${localeMetaData.repo} (${i}/${localesToLoad.length})`)

        const [owner, repo] = localeMetaData.repo.split('/')
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
        console.log(
            `-> loading directory ${localeMetaData.repo} locally (${i}/${localesToLoad.length})`
        )

        const [owner, repo] = localeMetaData.repo.split('/')

        // __dirname = /Users/sacha/Dev/state-of-js-graphql-results-api/dist
        const devDir = __dirname.split('/').slice(1, -3).join('/')
        const path = `/${devDir}/stateof-locales/${repo}`
        const files = await readdir(path)
        const yamlFiles = files.filter((f: String) => f.includes('.yml'))

        // loop over repo contents and fetch raw yaml files
        for (const fileName of yamlFiles) {
            if (!excludedFiles.includes(fileName)) {
                const filePath = path + '/' + fileName
                const contents = await readFile(filePath, 'utf8')
                const yamlContents: any = yaml.load(contents)
                const strings = yamlContents.translations
                const context = fileName.replace('./', '').replace('.yml', '')
                localeRawData.stringFiles.push({
                    strings,
                    url: filePath,
                    context
                })
            }
        }
        locales.push(localeRawData)
    }
    return locales
}

/*

Load the YAML file containing metadata for all locales

*/
export const getLocalesYAML = () => {
    // only keep locales which have a repo defined
    const localesWithRepos = localesYAML.filter((locale: Locale) => !!locale.repo)
    return localesWithRepos
}

/*

Get metadata for a single locale

*/
export const getLocaleYAML = (localeId: string) => {
    return getLocalesYAML().find((l: Locale) => l.id === localeId)
}

/*

Get a list of the ids for all the locales in the YAML

*/
export const getLocaleIdsList = () => {
    return getLocalesYAML().map((l: Locale) => l.id)
}

/*

Load locales contents through GitHub API or locally

*/
export const loadLocales = async (localeIds?: string[]): Promise<LocaleRawData[]> => {
    const allLocales = getLocalesYAML()
    const localesToLoad = localeIds
        ? allLocales.filter((locale: LocaleMetaData) => localeIds.includes(locale.id))
        : allLocales
    console.log(`// loading locales… (${localesToLoad.map((l: LocaleMetaData) => l.id).join(',')})`)
    const locales =
        process.env.LOAD_LOCALES === 'local'
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
        // if markdown-parsed version of the string is different from original, add it as HTML
        const tHtml = marked.parseInline(String(s.t))
        if (tHtml !== s.t) {
            s.tHtml = tHtml
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

            if (
                localeTranslationIndex === -1 ||
                localeStrings[localeTranslationIndex].t === enTranslation.t ||
                (localeStrings[localeTranslationIndex].t &&
                    localeStrings[localeTranslationIndex].t.trim() === 'TODO')
            ) {
                // en-US key doesn't exist in current locale file
                // OR current locale file's translation is same as en-US (untranslated)
                // OR is "TODO"
                localeStrings.push({
                    ...enTranslation,
                    isFallback: true
                })
            } else {
                localeStrings[localeTranslationIndex].isFallback = false
            }
        })
        return stringFile
    }
}

///////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////// Metadata ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

export const computeMetaData = (locale: LocaleRawData, parsedStringFiles: StringFile[]) => {
    const isEn = locale.id === 'en-US'
    const allStrings: TranslationStringObject[] = flattenStringFiles(parsedStringFiles)
    const totalCount = allStrings.length
    const untranslatedKeys = isEn
        ? []
        : allStrings
              .filter((s: TranslationStringObject) => s.isFallback)
              .map((s: TranslationStringObject) => s.key)
    const translatedCount = totalCount - untranslatedKeys.length
    const completion = isEn ? 100 : Math.round((translatedCount * 100) / totalCount)
    const dynamicData = {
        totalCount,
        translatedCount,
        completion,
        untranslatedKeys
    }
    const yamlData = getLocaleYAML(locale.id)
    return { ...dynamicData, ...yamlData }
}

///////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////// Caching //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

/*

Init locales by parsing them and then caching them

*/
const STORE_RAW_DATA = false
export const initLocales = async (context: RequestContext) => {
    const startedAt = new Date()
    console.log(`// Initializing locales cache (Redis)…`)
    let i = 0
    const allLocalesRawData = await loadLocales()
    const enLocale = allLocalesRawData.find(l => l.id === 'en-US')
    if (!enLocale) {
        throw Error('Could not load locale en-US')
    }

    // parse en-US strings only once outside of main loop to
    // avoid repeating work
    const enParsedStringFiles = enLocale.stringFiles.map((sf: StringFile) => {
        const stringFileWithAliases = resolveAliases(sf, enLocale)
        const stringFileWithMarkdown = parseMarkdown(stringFileWithAliases)
        return stringFileWithMarkdown
    })

    // store list of all locales
    setCache(getAllLocalesListCacheKey(), getLocaleIdsList(), context)
    console.log(`-> Done caching list of all locales (${getAllLocalesListCacheKey()})`)

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

            if (STORE_RAW_DATA && localeStringFile) {
                // store raw data
                setCache(
                    getLocaleRawContextCacheKey(locale.id, localeStringFile.context),
                    localeStringFile,
                    context
                )
                console.log(
                    `-> Done caching raw locale (${getLocaleRawContextCacheKey(
                        locale.id,
                        localeStringFile.context
                    )})`
                )
            }

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
                // this context does exist, go through parsing process
                const stringFileWithAliases = resolveAliases(localeStringFile, locale)
                const stringFileWithMarkdown = parseMarkdown(stringFileWithAliases)
                stringFileWithFallbacks = addFallbacks(stringFileWithMarkdown, locale, enStringFile)
            }
            parsedStringFiles.push(stringFileWithFallbacks)
            setCache(
                getLocaleParsedContextCacheKey(locale.id, enStringFile.context),
                stringFileWithFallbacks,
                context
            )
            console.log(
                `-> Done caching locale ${getLocaleParsedContextCacheKey(
                    locale.id,
                    enStringFile.context
                )} (${j}/${enParsedStringFiles.length})`
            )
        }

        // store metadata
        setCache(
            getLocaleMetaDataCacheKey(locale.id),
            computeMetaData(locale, parsedStringFiles),
            context
        )
        console.log(`-> Done caching metadata ${getLocaleMetaDataCacheKey(locale.id)}`)
    }
    const finishedAt = new Date()
    console.log(
        `=> Locales cache initialization done in ${finishedAt.getTime() - startedAt.getTime()}ms.`
    )
}
