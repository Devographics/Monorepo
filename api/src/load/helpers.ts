import { Entity } from '@devographics/types'
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
