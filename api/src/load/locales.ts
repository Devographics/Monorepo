import { Locale, RawLocale } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last.js'
import path from 'path'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'

import { RequestContext } from '../types'
import { processLocales } from '../helpers/locales'
import { splitEnvVar } from './helpers'

///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// Data Loading //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

let Locales: Locale[] = []

export const allContexts: string[] = []
const excludedFiles = ['config.yml', 'crowdin.yml', 'legacy.yml']

export const addToAllContexts = (context: string) => {
    if (!allContexts.includes(context)) {
        allContexts.push(context)
    }
}

export const getAllContexts = () => {
    return allContexts
}

export const loadAllFromGitHub = async (options?: LoadAllOptions): Promise<RawLocale[]> => {
    const { localeIds } = options
    const localesPathArray = splitEnvVar(getEnvVar(EnvVar.GITHUB_PATH_LOCALES))
    let locales: RawLocale[] = []
    if (localesPathArray) {
        for (const localesPath of localesPathArray) {
            const [org, repo, dir] = localesPath?.split('/') || []
            if (repo && dir) {
                await loadLocalesFromGitHubSameRepo({ locales, localeIds, org, repo, dir })
            } else if (org) {
                await loadLocalesFromGitHubMultiRepo({ locales, localeIds, org })
            } else {
                throw new Error(
                    'loadAllFromGitHub: Variable GITHUB_PATH_LOCALES ("org/repo/dir") did not contain an [org] segment'
                )
            }
        }
    }
    return locales
}

/*

1. All locales are in a subdir of the same repo

*/
const loadLocalesFromGitHubSameRepo = async ({
    locales,
    localeIds,
    org,
    repo,
    dir
}: {
    locales: RawLocale[]
    localeIds?: string[]
    org: string
    repo: string
    dir: string
}) => {
    const url = `repos/${org}/${repo}/contents/${dir}`
    console.log(`🌐 loadLocalesFromGitHubSameRepo (${url})`)

    const octokit = new Octokit({ auth: getEnvVar(EnvVar.GITHUB_TOKEN) })
    // let locales: RawLocale[] = []
    let i = 0

    const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: org,
        repo,
        path: dir
    })
    const localeDirectories = contents.data as any[]

    for (const localeDirectory of localeDirectories) {
        const localeId = localeDirectory.name.replace('locale-', '')
        if (localeIds && localeIds.length > 0 && localeIds.includes(localeId)) {
            i++
            console.log(
                `-> loading directory ${localeDirectory.name || localeDirectory.full_name} (${i}/${
                    localeDirectories.length
                }) (/repos/${org}/${repo}/contents/${localeDirectory.path})`
            )
            const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: org,
                repo,
                path: localeDirectory.path
            })
            const localeRawData = await processGitHubLocale(contents, localeDirectory)
            // locales.push(localeRawData)
            const existingLocaleIndex = locales.findIndex(l => l.id === localeRawData.id)
            if (existingLocaleIndex !== -1) {
                locales[existingLocaleIndex] = mergeLocales(
                    locales[existingLocaleIndex],
                    localeRawData
                )
            } else {
                locales.push(localeRawData)
            }
        }
    }
    // return locales
}

/*

2. If no subdir is specified, we assume all locales have their own repo

*/
const loadLocalesFromGitHubMultiRepo = async ({
    locales,
    localeIds,
    org
}: {
    locales: RawLocale[]
    localeIds?: string
    org: string
}) => {
    const url = `/orgs/${org}/repos`
    console.log(`🌐 loadLocalesFromGitHubMultiRepo (${url})`)

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    let i = 0

    const result = await octokit.request('GET /orgs/{org}/repos', {
        org,
        per_page: 100 // max
    })
    const allRepos = result.data
    const localeRepos = allRepos.filter(repo => repo.name.includes('locale-'))

    for (const localeRepo of localeRepos) {
        const localeId = localeRepo.full_name.replace('locale-', '')
        if (localeIds && localeIds.length > 0 && localeIds.includes(localeId)) {
            i++
            console.log(`-> loading repo ${localeRepo.full_name} (${i}/${localeRepos.length})`)
            const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: org,
                repo: localeRepo.name,
                path: ''
            })
            const localeRawData = await processGitHubLocale(contents, localeRepo)
            // locales.push(localeRawData)
            const existingLocaleIndex = locales.findIndex(l => l.id === localeRawData.id)
            if (existingLocaleIndex !== -1) {
                locales[existingLocaleIndex] = mergeLocales(
                    locales[existingLocaleIndex],
                    localeRawData
                )
            } else {
                locales.push(localeRawData)
            }
        }
    }
    // return locales
}

const processGitHubLocale = async (contents: any, localeRepo: any) => {
    const files = contents.data as any[]
    const localeConfigFile = files.find(f => f.name === 'config.yml')
    if (!localeConfigFile) {
        throw new Error(`Could not find config.yml file for locale ${localeRepo.full_name}`)
    }
    const localeConfigResponse = await fetch(localeConfigFile.download_url)
    const localeConfigContents = await localeConfigResponse.text()
    const localeConfig: any = yaml.load(localeConfigContents)

    const localeRawData: RawLocale = { ...localeConfig, stringFiles: [] }

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
    logToFile(`locales_raw/github_${localeConfig.id}.yml`, localeRawData, {
        mode: 'overwrite'
    })
    return localeRawData
}
interface LoadAllOptions {
    localeIds?: string[]
}
// when developing locally, load from local files
export const loadAllLocally = async (options: LoadAllOptions = {}): Promise<RawLocale[]> => {
    const { localeIds } = options
    let i = 0
    let locales: RawLocale[] = []

    const localesPathString = getEnvVar(EnvVar.LOCALES_PATH)
    if (!localesPathString) {
        throw new Error('LOCALES_PATH not set')
    }
    // localesPath can now be a comma-separated list of paths
    const localesPathArray = localesPathString.split(',')
    let pathIndex = 0
    for (const localesPath of localesPathArray) {
        pathIndex++
        const allLocalesDirPath = path.resolve(localesPath)

        const allFiles = await readdir(allLocalesDirPath)
        let allLocales = allFiles.filter(fileName => fileName.includes('locale-'))
        // if we only want to load specific locales, filter down allLocales to only keep those
        if (localeIds && localeIds.length > 0) {
            allLocales = allLocales.filter(localeName =>
                localeIds.includes(localeName.replace('locale-', ''))
            )
        }
        for (const localeDirName of allLocales) {
            const localeDirPath = `${allLocalesDirPath}/${localeDirName}`
            const localeConfigPath = `${allLocalesDirPath}/${localeDirName}/config.yml`
            const localeConfigContents = await readFile(localeConfigPath, 'utf8')
            const localeConfig: any = yaml.load(localeConfigContents)

            const localeRawData: RawLocale = { ...localeConfig, stringFiles: [] }
            i++
            console.log(`-> loading directory ${localeDirName} locally (${i}/${allLocales.length})`)

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
            logToFile(`locales_raw/filesystem_${localeConfig.id}_${pathIndex}.yml`, localeRawData)

            const existingLocaleIndex = locales.findIndex(l => l.id === localeRawData.id)
            if (existingLocaleIndex !== -1) {
                locales[existingLocaleIndex] = mergeLocales(
                    locales[existingLocaleIndex],
                    localeRawData
                )
            } else {
                locales.push(localeRawData)
            }
        }
    }
    return locales
}

const mergeLocales = (locale1: RawLocale, locale2: RawLocale) => {
    return {
        ...locale1,
        translators: [...locale1.translators, ...locale2.translators],
        stringFiles: [...locale1.stringFiles, ...locale2.stringFiles]
    }
}
/*

Load the YAML file containing metadata for all locales

*/
// export const getLocalesMetadataYAML = (): LocaleMetaData[] => {
//     return localesYAML
// }

/* 

Load locales if not yet loaded

*/
export const loadOrGetLocales = async (
    options: { forceReload?: boolean } = { forceReload: false },
    context?: RequestContext
): Promise<Array<Locale>> => {
    const { forceReload } = options
    const localeIds = getLocaleIds()
    if (forceReload || Locales.length === 0) {
        const rawLocales = await loadLocales(localeIds)
        Locales = processLocales(rawLocales)
        if (context) {
            context.locales = Locales
        }
    }
    return Locales
}

export const initLocales = async () => {
    const locales = await loadOrGetLocales({ forceReload: true })
    Locales = locales
}

export const getLocalesLoadMethod = () => (getEnvVar(EnvVar.LOCALES_PATH) ? 'local' : 'github')

export const getLocaleIds = () => {
    const enableFastBuild = process.env.FAST_BUILD === 'true'
    const envLocaleIds = splitEnvVar(getEnvVar(EnvVar.LOCALE_IDS))
    const localeIds = enableFastBuild ? ['en-US', 'ru-RU'] : envLocaleIds || []
    return localeIds
}

/*

Load locales contents through GitHub API or locally

*/
export const loadLocales = async (localeIds: string[] = []): Promise<RawLocale[]> => {
    const mode = getLocalesLoadMethod()
    console.log(
        `🌐 loading locales… (mode: ${mode} ${
            localeIds.length > 0 ? `; localeIds: ${localeIds.join(', ')}` : ''
        })`
    )
    const locales =
        mode === 'local'
            ? await loadAllLocally({ localeIds })
            : await loadAllFromGitHub({ localeIds })
    console.log('🌐 done loading locales')
    return locales
}
