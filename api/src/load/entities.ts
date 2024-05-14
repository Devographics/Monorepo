// import { Entity } from './types'
import { Entity, EntityType } from '@devographics/types'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile, stat } from 'fs/promises'
import { EnvVar, getEnvVar } from '@devographics/helpers'
import { logToFile } from '@devographics/debug'

import path from 'path'
import marked from 'marked'

// import hljs from 'highlight.js/lib/common'

import { RequestContext } from '../types'
import { SurveyApiObject, EditionApiObject } from '../types/surveys'
import { setCache } from '../helpers/caching'
import { EntityResolverMap, entityResolverMap } from '../resolvers/entities'
import isEmpty from 'lodash/isEmpty.js'
import { OptionId } from '@devographics/types'
import clone from 'lodash/clone.js'
import {
    getAvatar,
    getEntitiesFromYaml,
    getEntityType,
    getIdFromFileName,
    highlightEntitiesExampleCode,
    parseEntitiesMarkdown
} from './helpers'

let Entities: Entity[] = []

// load entities if not yet loaded
export const loadOrGetEntities = async (
    options: { forceReload?: boolean } = { forceReload: false },
    context?: RequestContext
) => {
    const { forceReload } = options

    if (forceReload || Entities.length === 0) {
        Entities = await loadEntities()
        Entities = await highlightEntitiesExampleCode(parseEntitiesMarkdown(Entities))
        if (context) {
            context.entities = Entities
        }
    }
    return Entities
}

/* --------------------------------------------------------------------------------------- */
/*                                       Load From GitHub                                  */
/* --------------------------------------------------------------------------------------- */

export const loadFromGitHub = async () => {
    const octokit = new Octokit({ auth: getEnvVar(EnvVar.GITHUB_TOKEN) })
    const [owner, repo, path = ''] = getEnvVar(EnvVar.GITHUB_PATH_ENTITIES)?.split('/') || []

    if (!owner) {
        throw new Error(
            'loadFromGitHub: env variable GITHUB_PATH_SURVEYS did not contain [owner] segment'
        )
    }
    if (!repo) {
        throw new Error(
            'loadFromGitHub: env variable GITHUB_PATH_SURVEYS did not contain [repo] segment'
        )
    }

    return await getGitHubDirEntities({ octokit, owner, repo }, path, [])
}

const getGitHubDirEntities = async (
    options: { octokit: any; owner: string; repo: string },
    path: string,
    parentDirs: string[]
) => {
    let entities = [] as Entity[]
    const { octokit, owner, repo } = options

    const getExtension = (file: any): string => file?.name.split('.').at(-1) || ''

    const isYaml = (file: any) => ['yml', 'yaml'].includes(getExtension(file))

    const url = `repos/${owner}/${repo}/contents/${path}`

    const contents = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}/', {
        owner,
        repo,
        path
    })
    const files = contents.data as any[]
    const yamlFiles = files.filter(isYaml)
    if (yamlFiles.length > 0) {
        console.log(`-> loading entities from GitHub (found ${yamlFiles.length} files in ${url})`)
    }

    // loop over repo contents and fetch raw yaml files
    for (const file of files) {
        if (file.type === 'dir' && file.name[0] !== '.') {
            entities = entities.concat(
                await getGitHubDirEntities(
                    options,
                    `${path}${path === '' ? '' : '/'}${file.name}`,
                    [...parentDirs, getIdFromFileName(file.name)]
                )
            )
        } else if (isYaml(file)) {
            const response = await fetch(file.download_url)
            const contents = await response.text()
            try {
                entities = entities.concat(
                    getEntitiesFromYaml({
                        contents,
                        tagsToAdd: [...parentDirs, getIdFromFileName(file.name)]
                    })
                )
            } catch (error) {
                console.log(`// Error loading file ${file.name}`)
                console.log(error)
            }
        }
    }
    return entities
}

/* --------------------------------------------------------------------------------------- */
/*                                         Load Locally                                    */
/* --------------------------------------------------------------------------------------- */

// when developing locally, load from local files
export const loadLocally = async () => {
    const entitiesDirPath = path.resolve(getEnvVar(EnvVar.ENTITIES_PATH))

    return await getLocalDirEntities(entitiesDirPath, [])
}

export const getLocalDirEntities = async (entitiesDirPath: string, parentDirs: string[]) => {
    let entities = [] as Entity[]
    const files = await readdir(entitiesDirPath)
    const yamlFiles = files.filter(fileName => fileName.includes('.yml'))

    if (yamlFiles.length > 0) {
        console.log(
            `-> loading entities locally (found ${yamlFiles.length} files in ${entitiesDirPath})`
        )
    }

    // loop over dir contents and fetch raw yaml files
    for (const fileName of files) {
        const filePath = entitiesDirPath + '/' + fileName
        const fileStats = await stat(filePath)
        if (fileStats.isDirectory() && fileName[0] !== '.') {
            // make sure to exclude directories starting with "." such as ".git"
            entities = entities.concat(
                await getLocalDirEntities(filePath, [...parentDirs, getIdFromFileName(fileName)])
            )
        } else if (fileName.includes('.yml')) {
            const contents = await readFile(filePath, 'utf8')
            entities = entities.concat(
                getEntitiesFromYaml({
                    contents,
                    tagsToAdd: [...parentDirs, getIdFromFileName(fileName)]
                })
            )
        }
    }
    return entities
}

/* --------------------------------------------------------------------------------------- */
/*                                           Init Load                                     */
/* --------------------------------------------------------------------------------------- */

export const getEntitiesLoadMethod = () => (getEnvVar(EnvVar.ENTITIES_PATH) ? 'local' : 'github')

// load locales contents through GitHub API or locally
export const loadEntities = async () => {
    const mode = getEntitiesLoadMethod()
    console.log(`// loading entities (mode: ${mode})`)
    const entities: Entity[] = mode === 'local' ? await loadLocally() : await loadFromGitHub()
    console.log('// done loading entities')
    logToFile('entities.json', entities, { mode: 'overwrite' })
    return entities
}

export const initEntities = async (context: RequestContext) => {
    console.log('// initializing entities…')
    const entities = await loadOrGetEntities({ forceReload: true }, context)
    Entities = entities
    return entities
}

export const getEntities = async (
    options: {
        ids?: OptionId[]
        tags?: string[]
        context?: RequestContext
        includeNormalizationEntities?: boolean
        includeAPIOnlyEntities?: boolean
    } = {}
) => {
    const {
        ids,
        tags,
        context,
        includeNormalizationEntities = false,
        includeAPIOnlyEntities = true
    } = options
    let entities = await loadOrGetEntities({}, context)

    if (!includeNormalizationEntities) {
        entities = entities.filter(e => !e.normalizationOnly)
    }
    if (!includeAPIOnlyEntities) {
        entities = entities.filter(e => !e.apiOnly)
    }
    if (ids) {
        entities = entities.filter(e => ids.includes(e.id))
    }
    if (tags) {
        entities = entities.filter(e => tags.every(t => e.tags && e.tags.includes(t)))
    }
    return entities
}

export const findEntity = (id: string, entities: Entity[], tag?: string) => {
    let parentId
    const matchingEntities = entities.filter(e => {
        return (
            (e.id && e.id.toLowerCase() === id) ||
            (e.id && e.id.toLowerCase().replace(/\-/g, '_') === id) ||
            (e.name && e.name.toLowerCase() === id)
        )
    })

    // keep the first entity we found
    const entity = matchingEntities[0]

    // if we're passing a tag, then find the version of the entity with that tag,
    // and use that to figure out the parentId
    if (tag) {
        const entityWithTag = matchingEntities.find(e => e.tags?.includes(tag))
        if (entityWithTag) {
            parentId = entityWithTag?.parentId
        }
    }

    return { ...entity, parentId }
}

export const getEntity = async ({
    id,
    context,
    includeNormalizationEntities = true,
    tag
}: {
    id: string | number
    context?: RequestContext
    includeNormalizationEntities?: boolean
    tag?: string
}) => {
    if (!id || typeof id !== 'string') {
        return
    }

    const entities = await getEntities({ context, includeNormalizationEntities })

    const entity = findEntity(id.toLowerCase(), entities, tag)

    if (!entity) {
        return
    }

    if (entity.type === EntityType.PEOPLE) {
        // TODO: find a way to cache this somehow?
        const avatar = await getAvatar(entity)
        if (avatar) {
            entity.avatar = avatar
        }
    }

    entity.type = getEntityType(entity)

    if (entity.belongsTo) {
        // if entity A belongs to another entity B, extend B with A and return the result
        const ownerEntity = findEntity(entity.belongsTo, entities)
        return { ...ownerEntity, ...entity }
    } else {
        return entity
    }
}

/*

Cache all the entities needed by a survey form

Note: entities should already have all resolvers applied to them
before being passed to cacheSurveysEntities()

TODO: probably not used anymore?

*/
export const cacheSurveysEntities = async ({
    surveys,
    entities,
    context
}: {
    surveys: SurveyApiObject[]
    entities: Entity[]
    context: RequestContext
}) => {
    console.log(`// Initializing entities cache (Redis)…`)
    setCache(getAllEntitiesCacheKey(), entities, context)
    console.log(`-> Cached ${entities.length} entities (${getAllEntitiesCacheKey()})`)

    for (const survey of surveys) {
        for (const edition of survey.editions) {
            const editionId = edition?.id
            const entityIds = extractEntityIds(edition)
            const editionEntities = entities
                .filter(e => entityIds.includes(e.id))
                .filter(e => !e.normalizationOnly)
                .map(e => {
                    const { category, patterns, ...fieldsToKeep } = e
                    return fieldsToKeep
                })

            if (editionEntities.length > 0) {
                setCache(getSurveyEditionEntitiesCacheKey({ editionId }), editionEntities, context)
                console.log(
                    `-> Cached ${
                        editionEntities.length
                    } entities (${getSurveyEditionEntitiesCacheKey({ editionId })})`
                )
            }
        }
    }
}

/*

Apply GraphQL resolvers for Entity type to end up with the same object
as if we were querying the API through GraphQL

*/

type ResolverKey = keyof EntityResolverMap

export const applyEntityResolvers = async (entity_: Entity, context: RequestContext) => {
    const entity = clone(entity_)
    for (const resolverKey in entityResolverMap) {
        const resolver = entityResolverMap[resolverKey as ResolverKey]
        const resolvedValue = resolver && (await resolver(entity, null, context, {}))
        if (!isEmpty(resolvedValue)) {
            entity[resolverKey as ResolverKey] = resolvedValue
        }
    }
    return entity
}

/*

For a given survey questions outline, extract all mentioned entities

*/
export const extractEntityIds = (edition: EditionApiObject) => {
    let entityIds: string[] = []
    if (edition.credits) {
        entityIds = [...entityIds, ...edition.credits.map(c => c.id)]
    }
    if (edition.sections && !isEmpty(edition.sections)) {
        for (const section of edition.sections) {
            for (const question of section.questions) {
                entityIds.push(question.id)
                if (question.options) {
                    entityIds = [...entityIds, ...question.options.map(o => String(o.id))]
                }
            }
        }
    }
    return entityIds
}

export const getSurveyEditionEntitiesCacheKey = ({ editionId }: { editionId: string }) =>
    `entities_${editionId}`

export const getAllEntitiesCacheKey = () => `entities_all`
