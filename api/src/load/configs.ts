import yaml from 'js-yaml'
import { readdir, readFile, stat } from 'fs/promises'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import path from 'path'
import { getRepoSHA, listGitHubFiles } from '../external_apis'

import { getGitHubYamlFile, getSurveysLoadMethod, LoadOrGetSurveysOptions } from './surveys'

export let allConfigs: any
export let allConfigsHash: string

/**
 * Devographics-wide configs (sponsors.yml, etc.) live in a `_configs` directory
 * at the root of the surveys directory (next to the survey directories).
 *
 * Both loaders return `{ configs, sha }`, where `configs` is keyed by file name
 * without extension, e.g. `{ sponsors: [...], someOtherConfig: {...} }`
 */
const CONFIGS_DIRECTORY = '_configs'

const isYamlFile = (fileName: string) => /\.ya?ml$/i.test(fileName)

const getConfigName = (fileName: string) => fileName.replace(/\.ya?ml$/i, '')

export const loadConfigsFromGitHub = async () => {
    const configs: Record<string, any> = {}

    const [owner, repo, ...surveysDirSegments] =
        getEnvVar(EnvVar.GITHUB_PATH_SURVEYS, {
            hardFail: true,
            calledFrom: 'loadConfigsFromGitHub'
        })?.split('/') || []

    if (!owner) {
        throw new Error(
            'loadConfigsFromGitHub: env variable GITHUB_PATH_SURVEYS did not contain [owner] segment'
        )
    }
    if (!repo) {
        throw new Error(
            'loadConfigsFromGitHub: env variable GITHUB_PATH_SURVEYS did not contain [repo] segment'
        )
    }

    const configsDirPath = [...surveysDirSegments, CONFIGS_DIRECTORY].filter(Boolean).join('/')

    console.log(`📖 Loading configs from GitHub (${owner}/${repo}/${configsDirPath})…`)

    let files: any[] = []
    try {
        files = await listGitHubFiles({ owner, repo, path: configsDirPath })
    } catch (error: any) {
        // directory doesn't exist (yet) in the repo
        if (error?.status === 404) {
            console.log(`📖 No ${CONFIGS_DIRECTORY} directory found, skipping`)
        } else {
            throw error
        }
    }

    for (const file of files) {
        if (file.type !== 'file' || !isYamlFile(file.name)) {
            continue
        }
        configs[getConfigName(file.name)] = await getGitHubYamlFile(file.download_url)
    }

    const sha = await getRepoSHA({ owner, repo })
    return { configs, sha }
}

// when developing locally, load from local files
export const loadConfigsLocally = async () => {
    const configs: Record<string, any> = {}

    const surveysPath = getEnvVar(EnvVar.SURVEYS_PATH)
    const surveysDirPath = path.resolve(surveysPath)
    const configsDirPath = path.join(surveysDirPath, CONFIGS_DIRECTORY)

    console.log(`📖 Loading configs locally (${configsDirPath})…`)

    let isDirectory = false
    try {
        isDirectory = (await stat(configsDirPath)).isDirectory()
    } catch (error) {
        // directory doesn't exist
    }

    if (!isDirectory) {
        console.log(`📖 No ${CONFIGS_DIRECTORY} directory found, skipping`)
        return { configs, sha: '<local repository>' }
    }

    const fileNames = await readdir(configsDirPath)

    for (const fileName of fileNames) {
        if (!isYamlFile(fileName)) {
            continue
        }
        try {
            const contents = await readFile(path.join(configsDirPath, fileName), 'utf8')
            configs[getConfigName(fileName)] = yaml.load(contents)
        } catch (error) {
            console.log(`YAML parsing error for ${CONFIGS_DIRECTORY}/${fileName}`)
            console.log(error)
        }
    }

    return { configs, sha: '<local repository>' }
}

// load locales contents through GitHub API or locally
export const loadConfigs = async () => {
    const mode = getSurveysLoadMethod()
    console.log(`// loading configs (mode: ${mode})`)
    const { configs, sha } =
        mode === 'local' ? await loadConfigsLocally() : await loadConfigsFromGitHub()
    console.log(`// done loading configs; commit SHA: ${sha}`)

    return { configs, sha }
}

export const loadOrGetConfigs = async (options: LoadOrGetSurveysOptions = {}) => {
    const { forceReload, context } = options

    if (context && forceReload) {
        const { configs, sha } = await loadConfigs()
        allConfigs = configs
        allConfigsHash = sha
    }
    return { configs: allConfigs, sha: allConfigsHash }
}
