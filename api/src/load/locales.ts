import { Locale, RawLocale, LocaleMetaData } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last.js'
import path from 'path'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'

import { appSettings } from '../helpers/settings'
import { RequestContext } from '../types'
import { processLocales } from '../helpers/locales'

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
    const localesPath = getEnvVar(EnvVar.GITHUB_PATH_LOCALES)
    const [org, repo, dir] = localesPath?.split('/') || []
    if (repo && dir) {
        return await loadAllFromGitHubSameRepo({ org, repo, dir })
    } else if (org) {
        return await loadAllFromGitHubMultiRepo({ org })
    } else {
        throw new Error(
            'loadAllFromGitHub: Variable GITHUB_PATH_LOCALES ("org/repo/dir") did not contain an [org] segment'
        )
    }
}

/*

1. All locales are in a subdir of the same repo

*/
const loadAllFromGitHubSameRepo = async ({
    org,
    repo,
    dir
}: {
    org: string
    repo: string
    dir: string
}) => {
    const url = `repos/${org}/${repo}/contents/${dir}`
    console.log(`🌐 loadAllFromGitHubSameRepo (${url}`)

    const octokit = new Octokit({ auth: getEnvVar(EnvVar.GITHUB_TOKEN) })
    let locales: RawLocale[] = []
    let i = 0

    const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner: org,
        repo,
        path: dir
    })
    const localeDirectories = contents.data as any[]

    for (const localeDirectory of localeDirectories) {
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
        locales.push(localeRawData)
    }
    return locales
}

/*

2. If no subdir is specified, we assume all locales have their own repo

*/
const loadAllFromGitHubMultiRepo = async ({ org }: { org: string }) => {
    const url = `/orgs/${org}/repos`
    console.log(`🌐 loadAllFromGitHubMultiRepo (${url}`)

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    let locales: RawLocale[] = []
    let i = 0

    const result = await octokit.request('GET /orgs/{org}/repos', {
        org,
        per_page: 100 // max
    })
    const allRepos = result.data
    const localeRepos = allRepos.filter(repo => repo.name.includes('locale-'))

    for (const localeRepo of localeRepos) {
        i++
        console.log(`-> loading repo ${localeRepo.full_name} (${i}/${localeRepos.length})`)
        const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: org,
            repo: localeRepo.name,
            path: ''
        })
        const localeRawData = await processGitHubLocale(contents, localeRepo)
        locales.push(localeRawData)
    }
    return locales
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

    const localesPath = getEnvVar(EnvVar.LOCALES_PATH)
    if (!localesPath) {
        throw new Error('LOCALES_PATH not set')
    }
    const allLocalesDirPath = path.resolve(localesPath)

    const allFiles = await readdir(allLocalesDirPath)
    let allLocales = allFiles.filter(fileName => fileName.includes('locale-'))
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
        logToFile(`locales_raw/filesystem_${localeConfig.id}.yml`, localeRawData)
        locales.push(localeRawData)
    }
    return locales
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

    const enableFastBuild = process.env.FAST_BUILD === 'true'
    const localeIds = enableFastBuild ? ['en-US', 'ru-RU'] : []
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
