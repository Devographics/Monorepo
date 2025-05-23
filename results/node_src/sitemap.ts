import findIndex from 'lodash/findIndex.js'
import findLastIndex from 'lodash/findLastIndex.js'
import omit from 'lodash/omit.js'
import template from 'lodash/template.js'
// @ts-ignore
import yaml from 'js-yaml'
import { getQuestionId, loadTemplate } from './helpers'
import merge from 'lodash/merge.js'
import type { RawSitemap, PageDef, BlockDefinition, BlockVariant } from '../src/core/types'

type Stack = { flat: Array<PageDef> }
type EditionVariables = { editionId: string; surveyId: string }

const stringify = (value: any) => {
    const json = JSON.stringify(value)
    let unquoted = json.replace(/"([^"]+)":/g, '$1:')
    // also remove any quotes next to "___" because this indicates a GraphQL enum
    unquoted = unquoted.replace('"___', '')
    unquoted = unquoted.replace('___"', '')
    return unquoted
}

// these two variables are used inside GraphQL arguments,
// so they need to be converted to strings
const keysToStringify = ['options', 'filters']

const injectVariables = (yamlObject: any, variables: any, templateName?: string) => {
    const stringVariables = {}
    Object.keys(variables).forEach(key => {
        const value = variables[key]
        stringVariables[key] = keysToStringify.includes(key) ? stringify(value) : value
    })

    try {
        // convert template object back to string for variables injection
        const templateString = yaml.dump(yamlObject)
        // Inject variables in raw yaml templates
        const interpolatedTemplate = template(templateString)(stringVariables)
        // convert raw populated template to object
        const populatedTemplate = yaml.load(interpolatedTemplate)

        return populatedTemplate
    } catch (error) {
        console.log(`// injectVariables error in template "${templateName}"`)
        console.log(error)
    }
}

const applyTemplate = ({
    block,
    mainBlock = {},
    templateObject,
    blockVariables = {},
    contextVariables = {}
}: any) => {
    // defines all available variables to be injected
    // at build time in the GraphQL queries
    const variables = {
        ...blockVariables,
        ...contextVariables,
        mainBlockId: mainBlock.id
    }

    const populatedTemplate = injectVariables(templateObject, variables, templateObject.name)
    const mergedTemplate = merge({}, populatedTemplate, block)

    return mergedTemplate
}

/**
 * Gets list of pages as a flat array given root pages
 * Called recursively
 */
const flattenSitemap = (
    stack: { flat: Array<PageDef> },
    pages: Array<PageDef>,
    parent: PageDef,
    pageIndex: number
) => {
    pages.forEach(page => {
        if (parent) {
            page.parent = omit(parent, 'children')
        }
        // always push everything at the root level, even during recursive iterations
        stack.flat.push(page)

        if (Array.isArray(page.children)) {
            flattenSitemap(stack, page.children, page, pageIndex)
        }
    })
}

export const pageFromConfig = async (page: PageDef, pageIndex: number, editionVariables: any) => {
    try {
        const { parent } = page

        const pagePath = page.path || `/${page.id}`
        page = {
            ...page,
            path:
                parent === undefined ? pagePath : `${parent?.path?.replace(/\/$/, '')}${pagePath}`,
            is_hidden: !!page.is_hidden,
            children: [],
            pageIndex
        }

        // if page has no defaultBlockType, get it from parent
        if (!page.defaultBlockType) {
            page.defaultBlockType = (parent && parent.defaultBlockType) || 'default'
        }

        if (!page.path.endsWith('/')) {
            page.path = `${page.path}/`
        }

        if (Array.isArray(page.blocks)) {
            const blocks: Array<BlockDefinition> = []
            for (const block of page.blocks) {
                // everything that's not in block.variants is part of the main block
                const { variants: variants_ = [], ...mainBlockConfig } = block
                const blockVariants = [{ ...mainBlockConfig, isMainBlock: true }, ...variants_]

                const variants: Array<BlockVariant> = []

                for (let blockVariant of blockVariants) {
                    // if template has been provided, apply it

                    // if block has variables, inject them based on current page and global variables
                    if (blockVariant.variables) {
                        blockVariant.variables = injectVariables(blockVariant.variables, page)
                    }

                    // also pass page variables to block so it can inherit them
                    // if (page.variables) {
                    //     blockVariant.pageVariables = injectVariables(page.variables, page)
                    // }

                    if (blockVariant.template) {
                        const templateObject = await loadTemplate(blockVariant.template)

                        const contextVariables = {
                            ...editionVariables,
                            sectionId: block?.queryOptions?.sectionId || page.id,
                            questionId: blockVariant.id
                        }

                        blockVariant = applyTemplate({
                            block: blockVariant,
                            mainBlock: mainBlockConfig,
                            templateObject,
                            blockVariables: blockVariant.variables,
                            contextVariables
                        })

                        if (blockVariant.facet) {
                            // fieldId: id of the GraphQL field (e.g. gender)
                            blockVariant.fieldId = blockVariant.id
                            // id: id of the question (e.g. gender_by_age)
                            blockVariant.id = getQuestionId(blockVariant.id, blockVariant.facet)
                        }
                    }

                    // if block type is missing, get it from parent
                    if (!blockVariant.blockType) {
                        blockVariant.blockType = page.defaultBlockType
                    }

                    blockVariant.path = `${page.path}${blockVariant.id}/`

                    blockVariant.sectionId = page.id
                    blockVariant.sectioni18nNamespace = page.i18nNamespace

                    variants.push(blockVariant)
                }

                const mainBlockId = block.id ?? variants[0].id
                blocks.push({ id: mainBlockId, variants })
            }

            page.blocks = blocks
        }
        return page
    } catch (error) {
        console.error('// pageFromConfig Error', error)
        throw error
    }
}

const computedSitemap = null
export const computeSitemap = async (
    rawSitemap: RawSitemap,
    editionVariables: EditionVariables
): Promise<Stack> => {
    if (computedSitemap !== null) {
        return computedSitemap
    }

    /**
     * @type {{flat: import('../src/core/types'.Sitemap)}}
     */
    const stack: { flat: Array<PageDef> } = {
        flat: []
    }

    // @ts-expect-error TODO fix me
    flattenSitemap(stack, rawSitemap, undefined, 0)

    // @ts-expect-error TODO fix me
    stack.flat = await Promise.all(
        stack.flat.map((page, pageIndex) => pageFromConfig(page, pageIndex, editionVariables))
    )

    // assign prev/next page using flat pages
    stack.flat.forEach(page => {
        // if the page is hidden, do not generate pagination for it
        if (page.is_hidden) return

        const index = findIndex(stack.flat, p => p.path === page.path)
        const previous = stack.flat[index - 1]

        // we exclude hidden pages from pagination
        if (previous !== undefined && previous.is_hidden !== true) {
            page.previous = omit(previous, ['is_hidden', 'previous', 'next', 'children', 'blocks'])
        }

        const lastIndex = findLastIndex(stack.flat, p => p.path === page.path)
        const next = stack.flat[lastIndex + 1]

        // we exclude hidden pages from pagination
        if (next !== undefined && next.is_hidden !== true) {
            page.next = omit(next, ['is_hidden', 'previous', 'next', 'children', 'blocks'])
        }
    })

    return stack
}
