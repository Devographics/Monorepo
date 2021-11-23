import { Entity } from './types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last'
import { logToFile } from './debug'

let entities: Entity[] = []

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// load locales if not yet loaded
export const loadOrGetEntities = async () => {
    if (entities.length === 0) {
        entities = await loadEntities()
    }
    return entities
}

export const loadFromGitHub = async () => {
    const entities: Entity[] = []
    console.log(`-> loading entities repo`)

    const options = {
        owner: 'StateOfJS',
        repo: 'entities',
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
                const category = file.name.replace('./', '').replace('.yml', '')
                yamlContents.forEach((entity: Entity) => {
                    const tags = entity.tags ? [...entity.tags, category] : [category]
                    entities.push({
                        ...entity,
                        category,
                        tags
                    })
                })
            } catch (error) {
                console.log(`// Error loading file ${file.name}`)
                console.log(error)
            }
        }
    }
    return entities
}

// when developing locally, load from local files
export const loadLocally = async () => {
    console.log(`-> loading entities locally`)

    const entities: Entity[] = []

    const devDir = __dirname.split('/').slice(1, -2).join('/')
    const path = `/${devDir}/stateof-entities/`
    const files = await readdir(path)
    const yamlFiles = files.filter((f: String) => f.includes('.yml'))

    // loop over dir contents and fetch raw yaml files
    for (const fileName of yamlFiles) {
        const filePath = path + '/' + fileName
        const contents = await readFile(filePath, 'utf8')
        const yamlContents: any = yaml.load(contents)
        const category = fileName.replace('./', '').replace('.yml', '')
        yamlContents.forEach((entity: Entity) => {
            const tags = entity.tags ? [...entity.tags, category] : [category]
            entities.push({
                ...entity,
                category,
                tags
            })
        })
    }

    return entities
}

// load locales contents through GitHub API or locally
export const loadEntities = async () => {
    console.log('// loading entities')

    const entities: Entity[] =
        process.env.LOAD_LOCALES === 'local' ? await loadLocally() : await loadFromGitHub()
    console.log('// done loading entities')

    return entities
}

export const initEntities = async () => {
  console.log('// initializing locales…')
  const entities = await loadOrGetEntities()
  logToFile('entities.json', entities, { mode: 'overwrite' })
}

export const getEntities = async ({ type, tag, tags }: { type?: string; tag?: string, tags?: string[] }) => {
  let entities = await loadOrGetEntities()
  if (type) {
      entities = entities.filter(e => e.type === type)
  }
  if (tag) {
      entities = entities.filter(e => e.tags && e.tags.includes(tag))
  }
  if (tags) {
      entities = entities.filter(e => tags.every(t => e.tags && e.tags.includes(t)))
  }
  return entities
}

// Look up entities by id, name, or aliases (case-insensitive)
export const getEntity = async ({ id }: { id: string | number }) => {
  const entities = await loadOrGetEntities()

  if (!id || typeof id !== 'string') {
      return
  }

  const lowerCaseId = id.toLowerCase()
  const entity = entities.find(e => {
      return (
          (e.id && e.id.toLowerCase() === lowerCaseId) ||
          (e.id && e.id.toLowerCase().replace(/\-/g, '_') === lowerCaseId) ||
          (e.name && e.name.toLowerCase() === lowerCaseId) ||
          (e.aliases && e.aliases.find((a: string) => a.toLowerCase() === lowerCaseId))
      )
  })

  return entity
}