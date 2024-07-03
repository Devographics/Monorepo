import { RawLocale } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import last from 'lodash/last.js'
import { EnvVar, getEnvVar, parseEnvVariableArray } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'

import { LoadAllOptions, addToAllContexts, excludedFiles, mergeLocales } from './locales'

/*

1. All locales are in a subdir of the same repo

*/
const loadLocalesFromGitHubSameRepo = async ({
    locales,
    localeIds,
    localeContexts,
    pathIndex,
    org,
    repo,
    dir
}: {
    locales: RawLocale[]
    localeIds?: string[]
    localeContexts?: string[]
    pathIndex: number
    org: string
    repo: string
    dir: string
}) => {
    const url = `repos/${org}/${repo}/contents/${dir}`
    console.log(`🌐 loadLocalesFromGitHubSameRepo (${url})`)

    const octokit = new Octokit({ auth: getEnvVar(EnvVar.GITHUB_TOKEN) })
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
                `📁 loading directory ${localeDirectory.name || localeDirectory.full_name} (${i}/${
                    localeDirectories.length
                }) (/repos/${org}/${repo}/contents/${localeDirectory.path})`
            )
            const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: org,
                repo,
                path: localeDirectory.path
            })
            const localeRawData = await processGitHubLocale({
                contents,
                localeRepo: localeDirectory,
                pathIndex,
                localeContexts
            })
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
}

/*

2. If no subdir is specified, we assume all locales have their own repo

*/
const loadLocalesFromGitHubMultiRepo = async ({
    locales,
    localeIds,
    localeContexts,
    pathIndex,
    org
}: {
    locales: RawLocale[]
    localeIds?: string[]
    localeContexts?: string[]
    pathIndex: number
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
    let localeRepos = allRepos.filter(repo => repo.name.includes('locale-'))

    if (localeIds && localeIds.length > 0) {
        localeRepos = localeRepos.filter(repo =>
            localeIds.includes(repo.name.replace('locale-', ''))
        )
    }

    for (const localeRepo of localeRepos) {
        const localeId = localeRepo.name.replace('locale-', '')
        i++
        console.log(`📁 loading repo ${localeRepo.full_name} (${i}/${localeRepos.length})`)
        const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: org,
            repo: localeRepo.name,
            path: ''
        })
        const localeRawData = await processGitHubLocale({
            contents,
            localeRepo,
            pathIndex,
            localeContexts
        })

        const existingLocaleIndex = locales.findIndex(l => l.id === localeRawData.id)
        if (existingLocaleIndex !== -1) {
            locales[existingLocaleIndex] = mergeLocales(locales[existingLocaleIndex], localeRawData)
        } else {
            locales.push(localeRawData)
        }
    }
}

const processGitHubLocale = async ({
    contents,
    localeRepo,
    pathIndex,
    localeContexts = []
}: {
    contents: any
    localeRepo: any
    pathIndex: number
    localeContexts?: string[]
}) => {
    const files = contents.data as any[]
    const localeFiles: string[] = []
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
                if (localeContexts.length === 0 || localeContexts.includes(context)) {
                    addToAllContexts(context)
                    localeFiles.push(file.name)
                    localeRawData.stringFiles.push({
                        strings,
                        url: file.download_url,
                        context
                    })
                }
            } catch (error) {
                console.log(`// Error loading file ${file.name}`)
                console.log(error)
            }
        }
    }
    logToFile(`locales_raw/github_${localeConfig.id}_${pathIndex}.yml`, localeRawData, {
        mode: 'overwrite'
    })
    console.log(`-> 📄 Processeded ${localeFiles.length} files (${localeFiles.join(', ')})`)

    return localeRawData
}

export const loadAllFromGitHub = async (options: LoadAllOptions = {}): Promise<RawLocale[]> => {
    const { localeIds, localeContexts } = options
    const localesPathArray = parseEnvVariableArray(getEnvVar(EnvVar.GITHUB_PATH_LOCALES))
    let locales: RawLocale[] = []
    if (localesPathArray) {
        let pathIndex = 0
        for (const localesPath of localesPathArray) {
            pathIndex++
            const [org, repo, dir] = localesPath?.split('/') || []
            if (repo && dir) {
                await loadLocalesFromGitHubSameRepo({
                    locales,
                    localeIds,
                    localeContexts,
                    pathIndex,
                    org,
                    repo,
                    dir
                })
            } else if (org) {
                await loadLocalesFromGitHubMultiRepo({
                    locales,
                    localeIds,
                    localeContexts,
                    pathIndex,
                    org
                })
            } else {
                throw new Error(
                    'loadAllFromGitHub: Variable GITHUB_PATH_LOCALES ("org/repo/dir") did not contain an [org] segment'
                )
            }
        }
    }
    return locales
}
