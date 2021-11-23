import { EnumTypeDefinitionNode } from 'graphql'
import { Entity, StringFile, Locale, TranslationStringObject } from './types'
import typeDefs from './type_defs/schema.graphql'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import localesYAML from './data/locales.yml'
import yaml from 'js-yaml'
import marked from 'marked'
import { logToFile } from './debug'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last'
import { loadOrGetEntities } from './entities'

let locales: Locale[] = []

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// load locales if not yet loaded
export const loadOrGetLocales = async () => {
    if (locales.length === 0) {
        locales = await loadLocales()
    }
    return locales
}

export const loadFromGitHub = async (localesWithRepos: any) => {
    let locales: Locale[] = []
    let i = 0

    for (const locale of localesWithRepos) {
        i++
        console.log(`-> loading repo ${locale.repo} (${i}/${localesWithRepos.length})`)

        locale.stringFiles = []

        const [owner, repo] = locale.repo.split('/')
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
            if (['yml', 'yaml'].includes(extension)) {
                const response = await fetch(file.download_url)
                const contents = await response.text()
                try {
                    const yamlContents: any = yaml.load(contents)
                    const strings = yamlContents.translations
                    const context = file.name.replace('./', '').replace('.yml', '')
                    locale.stringFiles.push({
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
        locales.push(locale)
    }
    return locales
}

// when developing locally, load from local files
export const loadLocally = async (localesWithRepos: any) => {
    let i = 0

    for (const locale of localesWithRepos) {
        i++
        console.log(`-> loading directory ${locale.repo} locally (${i}/${localesWithRepos.length})`)

        locale.stringFiles = []

        const [owner, repo] = locale.repo.split('/')

        // __dirname = /Users/sacha/Dev/state-of-js-graphql-results-api/dist
        const devDir = __dirname.split('/').slice(1, -2).join('/')
        const path = `/${devDir}/stateof-locales/${repo}`
        const files = await readdir(path)
        const yamlFiles = files.filter((f: String) => f.includes('.yml'))

        // loop over repo contents and fetch raw yaml files
        for (const fileName of yamlFiles) {
            const filePath = path + '/' + fileName
            const contents = await readFile(filePath, 'utf8')
            const yamlContents: any = yaml.load(contents)
            const strings = yamlContents.translations
            const context = fileName.replace('./', '').replace('.yml', '')
            locale.stringFiles.push({
                strings,
                url: filePath,
                context
            })
        }
        locales.push(locale)
    }
    return locales
}

// load locales contents through GitHub API or locally
export const loadLocales = async () => {
    console.log('// loading locales…')
    // only keep locales which have a repo defined
    const localesWithRepos = localesYAML.filter((locale: Locale) => !!locale.repo)

    const locales: Locale[] =
        process.env.LOAD_LOCALES === 'local'
            ? await loadLocally(localesWithRepos)
            : await loadFromGitHub(localesWithRepos)
    console.log('// done loading locales')

    return locales
}

/**
 * Return either e.g. other_tools.browsers.choices or other_tools.browsers.others_normalized
 */
export const getOtherKey = (id: string) =>
    id.includes('_others') ? `${id.replace('_others', '')}.others_normalized` : `${id}.choices`

export const getGraphQLEnumValues = (name: string): string[] => {
    const enumDef = typeDefs.definitions.find(def => {
        return def.kind === 'EnumTypeDefinition' && def.name.value === name
    }) as EnumTypeDefinitionNode

    if (enumDef === undefined) {
        throw new Error(`No enum found matching name: ${name}`)
    }

    return enumDef.values!.map(v => v.name.value)
}

/*

For a given locale id, get closest existing key.

Ex: 

en-US -> en-US
en-us -> en-US
en-gb -> en-US
etc. 

*/
export const truncateKey = (key: string) => key.split('-')[0]

export const getValidLocale = async (localeId: string) => {
    const locales = await loadOrGetLocales()
    const exactLocale = locales.find(
        (locale: Locale) => locale.id.toLowerCase() === localeId.toLowerCase()
    )
    const similarLocale = locales.find(
        (locale: Locale) => truncateKey(locale.id) === truncateKey(localeId)
    )
    return exactLocale || similarLocale
}

/*

Get locale strings for a specific locale

*/
export const getLocaleStrings = (locale: Locale, contexts?: string[]) => {
    let stringFiles = locale.stringFiles

    // if contexts are specified, filter strings by them
    if (contexts) {
        stringFiles = stringFiles.filter((sf: StringFile) => {
            return contexts.includes(sf.context)
        })
    }

    // flatten all stringFiles together
    const strings = stringFiles
        .map((sf: StringFile) => {
            let { strings, prefix, context } = sf
            if (strings === null) {
                return []
            }

            // if strings need to be prefixed, do it now
            if (prefix) {
                strings = strings.map((s: TranslationStringObject) => ({
                    ...s,
                    key: `${prefix}.${s.key}`
                }))
            }
            // add context to all strings just in case
            strings = strings.map((s: TranslationStringObject) => ({ ...s, context }))
            // add HTML version in case string is markdown
            strings = strings.map((s: TranslationStringObject) => ({
                ...s,
                tHtml: marked(String(s.t))
            }))
            return strings
        })
        .flat()

    return { strings }
}

/*

Get locale strings with en-US strings as fallback

*/
export const getLocaleStringsWithFallback = async (locale: Locale, contexts?: string[]) => {
    let localeStrings: TranslationStringObject[] = [],
        translatedCount: number = 0,
        totalCount: number = 0,
        untranslatedKeys: string[] = []

    const enLocale = await getValidLocale('en-US')
    if (enLocale) {
        const enStrings = getLocaleStrings(enLocale, contexts).strings

        // handle en-US locale separetely first
        if (locale.id === 'en-US') {
            return {
                strings: enStrings.map((t: TranslationStringObject) => ({ ...t, fallback: false })),
                translatedCount: enStrings.length,
                totalCount: enStrings.length,
                completion: 100,
                untranslatedKeys
            }
        }

        localeStrings = getLocaleStrings(locale, contexts).strings

        enStrings.forEach((enTranslation: TranslationStringObject) => {
            totalCount++
            // note: exclude fallback strings that might have been added during
            // a previous iteration of the current loop
            const localeTranslationIndex = localeStrings.findIndex(
                t => t.key === enTranslation.key && !t.fallback
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
                    fallback: true
                })
                untranslatedKeys.push(enTranslation.key)
            } else {
                // current locale has key, no fallback needed
                translatedCount++
                localeStrings[localeTranslationIndex].fallback = false
            }
        })
    }
    return {
        strings: localeStrings,
        translatedCount,
        totalCount,
        completion: Math.round((translatedCount * 100) / totalCount),
        untranslatedKeys
    }
}

/*

Get a specific locale object with properly parsed strings

*/
export const getLocaleObject = async (
    localeId: string,
    contexts?: string[],
    enableFallbacks: boolean = true
) => {
    const validLocale = await getValidLocale(localeId)
    if (!validLocale) {
        throw new Error(`No locale found for key ${localeId}`)
    }
    const localeData = enableFallbacks
        ? await getLocaleStringsWithFallback(validLocale, contexts)
        : await getLocaleStrings(validLocale, contexts)

    return {
        ...validLocale,
        ...localeData
    }
}

/*

Get all locales

*/
export const getLocales = async (contexts?: string[], enableFallbacks?: boolean) => {
    const rawLocales = await loadOrGetLocales()
    const locales = []
    for (const locale of rawLocales) {
        const localeObject = await getLocaleObject(locale.id, contexts, enableFallbacks)
        locales.push(localeObject)
    }
    return locales
}

/*

Get a specific translation

Reverse array first so that strings added last take priority

*/
export const getTranslation = async (key: string, localeId: string) => {
    const locale = await getLocaleObject(localeId)
    return locale.strings.reverse().find((s: any) => s.key === key)
}

export const initLocales = async () => {
    console.log('// initializing locales…')
    const rawLocales = await loadOrGetLocales()
    logToFile('raw_locales.json', rawLocales, { mode: 'overwrite' })
    const parsedLocales = await getLocales()
    logToFile('parsed_locales.json', parsedLocales, { mode: 'overwrite' })
}
