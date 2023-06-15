// import { Entity } from './types'
import { EntityResolvedFields, Entity } from '@devographics/core-models'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last.js'
import { logToFile } from '@devographics/helpers'
import path from 'path'
import marked from 'marked'
import hljs from 'highlight.js/lib/common'
import { appSettings } from '../helpers/settings'
import sanitizeHtml from 'sanitize-html'
import { RequestContext } from '../types'
import { SurveyApiObject, EditionApiObject, ResolverMap } from '../types/surveys'
import { setCache } from '../helpers/caching'
import { EntityResolverMap, entityResolverMap } from '../resolvers/entities'
import isEmpty from 'lodash/isEmpty.js'
import { OptionId } from '@devographics/types'

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

type MarkdownFields = 'name' | 'description'

const markdownFields: MarkdownFields[] = ['name', 'description']

const containsTagRegex = new RegExp(/(<([^>]+)>)/i)
const htmlEntitiesRegex = new RegExp(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/gi)

export const parseEntitiesMarkdown = (entities: Entity[]) => {
    for (const entity of entities) {
        for (const fieldName of markdownFields) {
            const field = entity[fieldName]
            if (field) {
                const fieldHtml = marked.parseInline(field)

                if (field !== fieldHtml || containsTagRegex.test(field)) {
                    entity[`${fieldName}Html`] = sanitizeHtml(fieldHtml)
                    entity[`${fieldName}Clean`] = sanitizeHtml(fieldHtml, {
                        allowedTags: []
                    })
                        .replace(htmlEntitiesRegex, '')
                        .replace('\n', '')
                } else {
                    entity[`${fieldName}Clean`] = field
                }
            }
        }
    }
    return entities
}

export const highlightEntitiesExampleCode = async (entities: Entity[]) => {
    for (const entity of entities) {
        const { example } = entity
        if (example) {
            const { code, language } = example
            // make sure to trim any extra /n at the end
            example.codeHighlighted = hljs.highlight(code.trim(), { language }).value
        }
    }
    return entities
}

export const loadFromGitHub = async () => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
    const entities: Entity[] = []
    console.log(`-> loading entities from GitHub`)

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
    const entities: Entity[] = []

    const entitiesDirPath = path.resolve(`../../${appSettings.entitiesDir}/`)

    console.log(`-> loading entities locally (${entitiesDirPath})`)

    const files = await readdir(entitiesDirPath)
    const yamlFiles = files.filter((f: String) => f.includes('.yml'))

    // loop over dir contents and fetch raw yaml files
    for (const fileName of yamlFiles) {
        const filePath = entitiesDirPath + '/' + fileName
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
        appSettings.loadLocalesMode === 'local' ? await loadLocally() : await loadFromGitHub()
    console.log('// done loading entities')

    return entities
}

export const initEntities = async (context: RequestContext) => {
    console.log('// initializing entities…')
    const entities = await loadOrGetEntities({ forceReload: true }, context)
    logToFile('entities.json', entities, { mode: 'overwrite' })
    return entities
}

export const getEntities = async ({
    ids,
    tags,
    context
}: {
    ids?: OptionId[]
    tags?: string[]
    context?: RequestContext
}) => {
    let entities = await loadOrGetEntities({}, context)

    entities = entities.filter(e => !e.normalizationOnly)
    if (ids) {
        entities = entities.filter(e => ids.includes(e.id))
    }
    if (tags) {
        entities = entities.filter(e => tags.every(t => e.tags && e.tags.includes(t)))
    }
    return entities
}

export const findEntity = (id: string, entities: Entity[]) =>
    entities.find(e => {
        return (
            (e.id && e.id.toLowerCase() === id) ||
            (e.id && e.id.toLowerCase().replace(/\-/g, '_') === id) ||
            (e.name && e.name.toLowerCase() === id)
        )
    })

export const getEntity = async ({
    id,
    context
}: {
    id: string | number
    context?: RequestContext
}) => {
    if (!id || typeof id !== 'string') {
        return
    }

    const entities = await getEntities({ context })

    const entity = findEntity(id.toLowerCase(), entities)

    if (!entity) {
        return
    }

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

export const applyEntityResolvers = async (entity: Entity, context: RequestContext) => {
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
