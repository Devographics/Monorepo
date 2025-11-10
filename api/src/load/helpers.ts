import { Avatar, Entity, EntityType } from '@devographics/types'
import fetch from 'node-fetch'
import yaml from 'js-yaml'
import sanitizeHtml from 'sanitize-html'
import uniq from 'lodash/uniq.js'
import marked from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import html from 'highlight.js/lib/languages/xml'
import http from 'highlight.js/lib/languages/http'
import css from 'highlight.js/lib/languages/css'
import graphql from 'highlight.js/lib/languages/graphql'
import json from 'highlight.js/lib/languages/json'
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('html', html)
hljs.registerLanguage('http', http)
hljs.registerLanguage('css', css)
hljs.registerLanguage('graphql', graphql)
hljs.registerLanguage('json', json)
import trim from 'lodash/trim.js'
import { cleanHtmlString } from '../helpers/strings'

// entities

export const getEntitiesFromYaml = ({
    contents,
    tagsToAdd
}: {
    contents: string
    tagsToAdd: string[]
}) => {
    const yamlContents = yaml.load(contents) as Entity[]
    if (yamlContents) {
        const entities: Entity[] = yamlContents.map(entity => {
            // merge tagsToAdd and entity's own tags property and keep unique tags
            const tags = uniq([...tagsToAdd, ...(entity.tags || [])])
            if (entity.webFeaturesId) {
                // special tag to denote if entity has a webFeatureId
                tags.push('has_web_features_id')
            }
            const isToken = tagsToAdd.includes('tokens')
            return {
                normalizationOnly: isToken,
                ...entity,
                tags
            }
        })
        return entities
    } else {
        return []
    }
}

export const getIdFromFileName = (fileName: string) =>
    fileName.replace('./', '').replace('.yml', '')

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
                    entity[`${fieldName}Clean`] = cleanHtmlString(fieldHtml)
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
            example.codeHighlighted = code
            if (language) {
                try {
                    // make sure to trim any extra /n at the end
                    example.codeHighlighted = hljs.highlight(code.trim(), { language }).value
                } catch (error) {
                    // ignore any highlighting errors
                }
            }
        }
    }
    return entities
}

async function checkImageExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        return response.ok // Image exists if response status is within the 200-299 range
    } catch (error) {
        return false // Error occurred or status code is not within the 200-299 range
    }
}

// TODO: WIP
export const getAllAvatars = async ({ entities }: { entities: Entity[] }) => {
    const avatars = []
    for (const entity of entities) {
        avatars.push(getAvatar({ entity }))
    }
    return avatars
}

export const getAvatar = async ({ entity }: { entity: Entity }) => {
    const avatarUrl = `${process.env.ASSETS_URL}/avatars/${entity.id}.jpg`
    const imageExists = await checkImageExists(avatarUrl)
    if (imageExists) {
        return { url: avatarUrl } as Avatar
    }
}

// version that doesn't actually check, to save time
export const getAvatarAlways = ({ entity }: { entity: Entity }) => {
    const avatarUrl = `${process.env.ASSETS_URL}/avatars/${entity.id}.jpg`
    return { url: avatarUrl } as Avatar
}

export const getEntityType = (entity: Entity) => {
    if (entity?.tags?.includes('people')) {
        return EntityType.PEOPLE
    } else if (entity?.tags?.includes('features')) {
        return EntityType.FEATURE
    } else if (entity?.tags?.includes('libraries') || entity?.tags?.includes('languages')) {
        return EntityType.LIBRARY
    } else {
        return EntityType.DEFAULT
    }
}
