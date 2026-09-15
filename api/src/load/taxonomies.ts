import fetch from 'node-fetch'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { EnvVar, getEnvVar, parseEnvVariableArray } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'
import { Taxonomy } from '@devographics/types'
import { getOctokit } from '../external_apis'

/*

A taxonomy is an optional, named hierarchy layered on top of entities. Unlike an
entity's default `parentId`, a taxonomy groups the same entities differently in a
specific context (e.g. job titles by role vs. by domain), which lets a "virtual"
question regroup already-normalized tokens without duplicating any data.

Every node has the same recursive shape at every level, so the tree can be any
number of levels deep:

    - id: <entity id>
      children:            # optional
        - id: <entity id>
          children: [ ... ]

Taxonomies live in a flat `taxonomies/` directory alongside the entities (one
YAML file per taxonomy), so — unlike entities — loading does not need to recurse
into nested directories.

The Taxonomy / TaxonomyNode types live in @devographics/types.

*/

// name of the directory holding taxonomy files, relative to each entities path
const TAXONOMIES_DIR = 'taxonomies'

let Taxonomies: Taxonomy[] = []

const isYamlFile = (fileName: string) => fileName.endsWith('.yml') || fileName.endsWith('.yaml')

// a taxonomy's id is always its file name (e.g. "job_titles.yml" -> "job_titles"),
// so there is no need for an `id` field inside the file
const getIdFromFileName = (fileName: string) => fileName.replace(/\.ya?ml$/, '')

const getTaxonomyFromYaml = (contents: string, id: string): Taxonomy | undefined => {
    const taxonomy = yaml.load(contents) as Taxonomy
    if (!taxonomy || !Array.isArray(taxonomy.tree)) {
        return undefined
    }
    return { ...taxonomy, id }
}

// mirror entities: local when an ENTITIES_PATH is set, otherwise GitHub
export const getTaxonomiesLoadMethod = () => (getEnvVar(EnvVar.ENTITIES_PATH) ? 'local' : 'github')

/* --------------------------------------------------------------------------------------- */
/*                                       Load From GitHub                                  */
/* --------------------------------------------------------------------------------------- */

const loadTaxonomiesFromGitHub = async () => {
    const octokit = getOctokit()
    const entitiesPathArray = parseEnvVariableArray(
        getEnvVar(EnvVar.GITHUB_PATH_ENTITIES, {
            hardFail: true,
            calledFrom: 'loadTaxonomiesFromGitHub'
        })
    )

    let taxonomies: Taxonomy[] = []

    for (const entitiesDirPath of entitiesPathArray) {
        const [owner, repo, entitiesPath = ''] = entitiesDirPath?.split('/') || []
        if (!owner || !repo) {
            throw new Error(
                `loadTaxonomiesFromGitHub: GITHUB_PATH_ENTITIES entry "${entitiesDirPath}" is missing an [owner] or [repo] segment`
            )
        }

        const taxonomiesPath = entitiesPath ? `${entitiesPath}/${TAXONOMIES_DIR}` : TAXONOMIES_DIR

        let files: any[] = []
        try {
            const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}/', {
                owner,
                repo,
                path: taxonomiesPath
            })
            files = contents.data as any[]
        } catch (error) {
            // a taxonomies/ directory is optional, so a missing one is not an error
            console.log(`// no ${taxonomiesPath} directory found in ${owner}/${repo}`)
            continue
        }

        const yamlFiles = files.filter(file => isYamlFile(file.name))
        if (yamlFiles.length > 0) {
            console.log(`-> loading ${yamlFiles.length} taxonomies from GitHub (${owner}/${repo})`)
        }
        for (const file of yamlFiles) {
            const response = await fetch(file.download_url)
            const contents = await response.text()
            try {
                const taxonomy = getTaxonomyFromYaml(contents, getIdFromFileName(file.name))
                if (taxonomy) {
                    taxonomies.push(taxonomy)
                }
            } catch (error) {
                console.log(`// Error loading taxonomy file ${file.name}`)
                console.log(error)
            }
        }
    }
    return taxonomies
}

/* --------------------------------------------------------------------------------------- */
/*                                         Load Locally                                    */
/* --------------------------------------------------------------------------------------- */

const loadTaxonomiesLocally = async () => {
    const entitiesPathArray = parseEnvVariableArray(getEnvVar(EnvVar.ENTITIES_PATH))
    let taxonomies: Taxonomy[] = []

    for (const entitiesPath of entitiesPathArray) {
        const taxonomiesDirPath = path.resolve(entitiesPath, TAXONOMIES_DIR)

        let files: string[]
        try {
            files = await readdir(taxonomiesDirPath)
        } catch (error) {
            // a taxonomies/ directory is optional, so a missing one is not an error
            console.log(`// no ${taxonomiesDirPath} directory found`)
            continue
        }

        const yamlFiles = files.filter(isYamlFile)
        if (yamlFiles.length > 0) {
            console.log(`-> loading ${yamlFiles.length} taxonomies locally (${taxonomiesDirPath})`)
        }
        for (const fileName of yamlFiles) {
            const contents = await readFile(path.join(taxonomiesDirPath, fileName), 'utf8')
            const taxonomy = getTaxonomyFromYaml(contents, getIdFromFileName(fileName))
            if (taxonomy) {
                taxonomies.push(taxonomy)
            }
        }
    }
    return taxonomies
}

/* --------------------------------------------------------------------------------------- */
/*                                           Init Load                                     */
/* --------------------------------------------------------------------------------------- */

export const loadTaxonomies = async () => {
    const mode = getTaxonomiesLoadMethod()
    console.log(`// loading taxonomies (mode: ${mode})`)
    const taxonomies =
        mode === 'local' ? await loadTaxonomiesLocally() : await loadTaxonomiesFromGitHub()
    console.log(`// done loading taxonomies (${taxonomies.length} found)`)
    logToFile('taxonomies.json', taxonomies, { mode: 'overwrite' })
    return taxonomies
}

// load taxonomies if not yet loaded
export const loadOrGetTaxonomies = async (
    options: { forceReload?: boolean } = { forceReload: false }
) => {
    const { forceReload } = options
    if (forceReload || Taxonomies.length === 0) {
        Taxonomies = await loadTaxonomies()
    }
    return Taxonomies
}

export const getTaxonomies = async () => loadOrGetTaxonomies({})

export const getTaxonomy = async (id: string) => {
    const taxonomies = await loadOrGetTaxonomies({})
    return taxonomies.find(taxonomy => taxonomy.id === id)
}
