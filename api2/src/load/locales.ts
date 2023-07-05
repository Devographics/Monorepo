import { Locale, RawLocale, LocaleMetaData } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last.js'
import path from 'path'
import { logToFile } from '@devographics/helpers'

import { appSettings } from '../helpers/settings'
import { RequestContext } from '../types'
import { processLocales } from '../helpers/locales'

///////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////// Data Loading //////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

let Locales: Locale[] = []

export const allContexts: string[] = []
const excludedFiles = ['config.yml', 'crowdin.yml']

export const addToAllContexts = (context: string) => {
    if (!allContexts.includes(context)) {
        allContexts.push(context)
    }
}

export const getAllContexts = () => {
    return allContexts
}

export const loadAllFromGitHub = async (options?: LoadAllOptions): Promise<RawLocale[]> => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    let locales: RawLocale[] = []
    let i = 0

    const org = 'devographics'
    const result = await octokit.request('GET /orgs/{org}/repos', {
        org,
        per_page: 100 // max
    })
    const allRepos = result.data
    const localeRepos = allRepos.filter(repo => repo.name.includes('locale-'))

    for (const localeRepo of localeRepos) {
        i++
        console.log(`-> loading repo ${localeRepo.full_name} (${i}/${localeRepos.length})`)

        const options = {
            owner: 'devographics',
            repo: localeRepo.name,
            path: ''
        }
        const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', options)
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
        logToFile(`github_${localeConfig.id}.yml`, localeRawData, {
            mode: 'overwrite',
            subDir: 'locales_raw'
        })
        locales.push(localeRawData)
    }
    return locales
}

interface LoadAllOptions {
    localeIds?: string[]
}
// when developing locally, load from local files
export const loadAllLocally = async (options?: LoadAllOptions): Promise<RawLocale[]> => {
    let i = 0
    let locales: RawLocale[] = []

    if (!process.env.LOCALES_DIR) {
        throw new Error('LOCALES_DIR not set')
    }
    const allLocalesDirPath = path.resolve(`../../${appSettings.localesDir}`)

    const allFiles = await readdir(allLocalesDirPath)
    const allLocales = allFiles.filter(fileName => fileName.includes('locale-'))
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
        logToFile(`filesystem_${localeConfig.id}.yml`, localeRawData, {
            mode: 'overwrite',
            subDir: 'locales_raw'
        })
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

    if (forceReload || Locales.length === 0) {
        const rawLocales = await loadLocales()
        Locales = processLocales(rawLocales)
        if (context) {
            context.locales = Locales
        }
    }
    return Locales
}

export const initLocales = async () => {
    await loadOrGetLocales({ forceReload: true })
}

/*

Load locales contents through GitHub API or locally

*/
export const loadLocales = async (localeIds?: string[]): Promise<RawLocale[]> => {
    console.log(`// loading locales… `)
    const locales =
        appSettings.loadLocalesMode === 'local'
            ? await loadAllLocally({ localeIds })
            : await loadAllFromGitHub({ localeIds })
    console.log('// done loading locales')
    return locales
}
