import { RawLocale } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import last from 'lodash/last.js'
import { EnvVar, getEnvVar, parseEnvVariableArray } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'

import { LoadAllOptions, addToAllContexts, excludedFiles, mergeLocales } from './locales'
import { getOctokit } from '../../external_apis'

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
    const octokit = getOctokit()
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

            const localeRawData = await initGitHubLocale({
                octokit,
                org,
                localeId: localeDirectory.name
            })
            const localeFiles: string[] = []

            // start recursive function
            const walkDirectory = async (currentPath: string, subDirName: string = 'root') => {
                console.log(`📁 parsing subdir /repos/${org}/${repo}${currentPath}…`)
                const contents = await octokit.request(
                    'GET /repos/{owner}/{repo}/contents/{path}',
                    {
                        owner: org,
                        repo,
                        path: currentPath
                    }
                )
                const files = contents.data as any[]
                const subDirectories = files.filter(
                    f => f.type === 'dir' && !f.name.startsWith('.')
                )

                await processGitHubLocaleFiles({
                    contents,
                    localeRawData,
                    localeFiles,
                    localeRepo: localeDirectory,
                    localeContexts
                })

                for (const subDir of subDirectories) {
                    await walkDirectory(currentPath + '/' + subDir.name, subDir.name)
                }
            }
            await walkDirectory(localeDirectory.path)

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

    const octokit = getOctokit()
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
        i++
        console.log(`📁 loading repo ${localeRepo.full_name} (${i}/${localeRepos.length})`)

        const localeRawData = await initGitHubLocale({
            octokit,
            org,
            localeId: localeRepo.name
        })
        const localeFiles: string[] = []

        // start recursive function
        const walkDirectory = async (currentPath: string, subDirName: string = 'root') => {
            console.log(`📁 parsing subdir /repos/${org}/${localeRepo.name}${currentPath}…`)

            const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
                owner: org,
                repo: localeRepo.name,
                path: currentPath
            })
            const files = contents.data as any[]
            const subDirectories = files.filter(f => f.type === 'dir' && !f.name.startsWith('.'))
            await processGitHubLocaleFiles({
                localeRawData,
                localeFiles,
                contents,
                localeRepo,
                localeContexts,
                subDirName
            })

            for (const subDir of subDirectories) {
                await walkDirectory(currentPath + '/' + subDir.name, subDir.name)
            }
        }
        await walkDirectory('')

        const existingLocaleIndex = locales.findIndex(l => l.id === localeRawData.id)
        if (existingLocaleIndex !== -1) {
            locales[existingLocaleIndex] = mergeLocales(locales[existingLocaleIndex], localeRawData)
        } else {
            locales.push(localeRawData)
        }

        logToFile(`locales_raw/github_${localeRawData.id}_${pathIndex}.yml`, localeRawData, {
            mode: 'overwrite'
        })
        console.log(`-> 📄 Processeded ${localeFiles.length} files (${localeFiles.join(', ')})`)
    }
}

/*

Load config.yml and initialize raw locale object

*/
const initGitHubLocale = async ({
    octokit,
    org,
    path = '',
    localeId
}: {
    octokit: Octokit
    org: string
    path?: string
    localeId: string
}) => {
    // request contents of locale config file
    const pathSegment = path === '' ? '' : '{path}/'
    const githubUrl = `GET /repos/{owner}/{repo}/contents/${pathSegment}config.yml`
    const contents = await octokit.request(githubUrl, {
        owner: org,
        repo: localeId,
        path
    })
    const configFile = contents.data
    if (!configFile) {
        throw new Error(`Could not find config.yml file for locale ${localeId}`)
    }
    const localeConfigResponse = await fetch(configFile.download_url)
    const localeConfigContents = await localeConfigResponse.text()
    const localeConfig: any = yaml.load(localeConfigContents)
    const localeRawData: RawLocale = { ...localeConfig, stringFiles: [] }

    return localeRawData
}

/*

Take directory contents and extract locale raw data

*/
const processGitHubLocaleFiles = async ({
    contents,
    localeFiles,
    localeRawData,
    localeContexts = [],
    subDirName = 'root'
}: {
    contents: any
    localeFiles: string[]
    localeRawData: RawLocale
    localeRepo: any
    localeContexts?: string[]
    subDirName?: string
}) => {
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
                if (localeContexts.length === 0 || localeContexts.includes(context)) {
                    addToAllContexts(context)
                    localeFiles.push(file.name)
                    localeRawData.stringFiles.push({
                        strings,
                        subDir: subDirName,
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
}

/*

Load all locales from GitHub

*/
export const loadLocalesFromGitHub = async (options: LoadAllOptions = {}): Promise<RawLocale[]> => {
    const { localeIds, localeContexts } = options
    const localesPathArray = parseEnvVariableArray(
        getEnvVar(EnvVar.GITHUB_PATH_LOCALES, {
            hardFail: true,
            calledFrom: 'loadLocalesFromGitHub'
        })
    )
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
