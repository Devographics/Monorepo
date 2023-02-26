// import { Entity } from './types'
import { Entity } from '@devographics/core-models'
import { Octokit } from '@octokit/core'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import { readdir, readFile } from 'fs/promises'
import last from 'lodash/last.js'
import { logToFile } from '../helpers/debug'
import path from 'path'
import marked from 'marked'
import hljs from 'highlight.js/lib/common'
import { appSettings } from '../helpers/settings'
import sanitizeHtml from 'sanitize-html'
import { RequestContext, Survey, SurveyEdition } from '../types'
import { setCache } from '../helpers/caching'
import entityResolvers from '../resolvers/entities'
import isEmpty from 'lodash/isEmpty.js'

let entities: Entity[] = []

// load locales if not yet loaded
export const loadOrGetEntities = async (
    options: { forceReload?: boolean } = { forceReload: false }
) => {
    const { forceReload } = options
    if (forceReload || entities.length === 0) {
        entities = await loadEntities()
    }
    return await highlightEntitiesExampleCode(parseEntitiesMarkdown(entities))
}

type MarkdownFields = 'name' | 'description'

const markdownFields: MarkdownFields[] = ['name', 'description']

export const parseEntitiesMarkdown = (entities: Entity[]) => {
    for (const entity of entities) {
        for (const fieldName of markdownFields) {
            const field = entity[fieldName]
            if (field) {
                const fieldHtml = marked.parseInline(field)
                const containsTagRegex = new RegExp(/(<([^>]+)>)/i)

                if (field !== fieldHtml || containsTagRegex.test(field)) {
                    entity[`${fieldName}Html`] = sanitizeHtml(fieldHtml)
                    entity[`${fieldName}Clean`] = sanitizeHtml(fieldHtml, {
                        allowedTags: []
                    })
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
    console.log(`-> loading entities locally`)

    const entities: Entity[] = []

    const entitiesDirPath = path.resolve(`../../${process.env.ENTITIES_DIR}/`)
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

export const initEntities = async () => {
    console.log('// initializing entities…')
    const entities = await loadOrGetEntities({ forceReload: true })
    logToFile('entities.json', entities, { mode: 'overwrite' })
    return entities
}

export const getEntities = async ({
    ids,
    tag,
    tags
}: {
    ids?: string[]
    tag?: string
    tags?: string[]
}) => {
    let entities = await loadOrGetEntities()
    entities = entities.filter(e => !e.normalizationOnly)
    if (ids) {
        entities = entities.filter(e => ids.includes(e.id))
    }
    if (tag) {
        entities = entities.filter(e => e.tags && e.tags.includes(tag))
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

export const getEntity = async ({ id }: { id: string | number }) => {
    if (!id || typeof id !== 'string') {
        return
    }

    const entities = await getEntities({})

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

*/
export const cacheSurveysEntities = async ({
    surveys,
    entities,
    context
}: {
    surveys: Survey[]
    entities: Entity[]
    context: RequestContext
}) => {
    console.log(`// Initializing entities cache (Redis)…`)
    setCache(getAllEntitiesCacheKey(), entities, context)
    console.log(`-> Cached ${entities.length} entities (${getAllEntitiesCacheKey()})`)

    for (const survey of surveys) {
        for (const edition of survey.editions) {
            const surveyId = edition?.surveyId
            const entityIds = extractEntityIds(edition)
            const editionEntities = entities
                .filter(e => entityIds.includes(e.id))
                .filter(e => !e.normalizationOnly)
                .map(e => {
                    const { category, patterns, ...fieldsToKeep } = e
                    return fieldsToKeep
                })

            if (editionEntities.length > 0) {
                setCache(getSurveyEditionEntitiesCacheKey({ surveyId }), editionEntities, context)
                console.log(
                    `-> Cached ${
                        editionEntities.length
                    } entities (${getSurveyEditionEntitiesCacheKey({ surveyId })})`
                )
            }
        }
    }
}

/*

Apply GraphQL resolvers for Entity type to end up with the same object
as if we were querying the API through GraphQL

*/
// TODO: seems unnecessary to have to define this type?
type EntityResolverKey = 'github' | 'mdn' | 'twitter' | 'caniuse' | 'homepage' | 'npm' | 'company'

export const applyEntityResolvers = async (entity: Entity, context: RequestContext) => {
    const resolvers = entityResolvers.Entity
    for (const resolverKey in resolvers) {
        const resolver = resolvers[resolverKey as EntityResolverKey]
        const resolvedValue = await resolver(entity, null, context)
        if (!isEmpty(resolvedValue)) {
            entity[resolverKey as EntityResolverKey] = resolvedValue
        }
    }
    return entity
}

/*

For a given survey questions outline, extract all mentioned entities

*/
export const extractEntityIds = (edition: SurveyEdition) => {
    let entityIds: string[] = []
    if (edition.credits) {
        entityIds = [...entityIds, ...edition.credits.map(c => c.id)]
    }
    if (edition.questions && !isEmpty(edition.questions)) {
        for (const section of edition.questions) {
            for (const question of section.questions) {
                entityIds.push(question.id)
                if (question.options) {
                    entityIds = [...entityIds, ...question.options.map(o => o.id)]
                }
            }
        }
    }
    return entityIds
}

export const getSurveyEditionEntitiesCacheKey = ({ surveyId }: { surveyId: string }) =>
    `entities_${surveyId}`

export const getAllEntitiesCacheKey = () => `entities_all`
