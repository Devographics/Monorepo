import { Locale, RawLocale, LocaleMetaData } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import localesYAML from '../data/locales.yml'
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
const excludedFiles = ['crowdin.yml']

export const addToAllContexts = (context: string) => {
    if (!allContexts.includes(context)) {
        allContexts.push(context)
    }
}

export const getAllContexts = () => {
    return allContexts
}

export const loadAllFromGitHub = async (localesToLoad: LocaleMetaData[]): Promise<RawLocale[]> => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    let locales: RawLocale[] = []
    let i = 0

    for (const localeMetaData of localesToLoad) {
        const localeRawData: RawLocale = { id: localeMetaData.id, stringFiles: [] }
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
        logToFile(`github_${localeMetaData.id}.yml`, localeRawData, {
            mode: 'overwrite',
            subDir: 'locales_raw'
        })
        locales.push(localeRawData)
    }
    return locales
}

// when developing locally, load from local files
export const loadAllLocally = async (localesToLoad: LocaleMetaData[]): Promise<RawLocale[]> => {
    let i = 0
    let locales: RawLocale[] = []

    for (const localeMetaData of localesToLoad) {
        const localeRawData: RawLocale = { id: localeMetaData.id, stringFiles: [] }
        i++
        const localeDirName = `locale-${localeMetaData.id}`
        console.log(`-> loading directory ${localeDirName} locally (${i}/${localesToLoad.length})`)

        if (!process.env.LOCALES_DIR) {
            throw new Error('LOCALES_DIR not set')
        }
        const localeDirPath = path.resolve(`../../${appSettings.localesDir}/${localeDirName}`)

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
        logToFile(`filesystem_${localeMetaData.id}.yml`, localeRawData, {
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
export const getLocalesMetadataYAML = (): LocaleMetaData[] => {
    return localesYAML
}

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
    const allLocales = getLocalesMetadataYAML()
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
