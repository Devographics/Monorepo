const fs = require('fs')
const { findIndex, findLastIndex, omit, template } = require('lodash')
const yaml = require('js-yaml')
const { getAllBlocks, loadTemplate, logToFile } = require('./helpers.js')

const globalVariables = yaml.load(
    fs.readFileSync(`./surveys/${process.env.SURVEY}/config/variables.yml`, 'utf8')
)

const stringify = value => {
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

const injectVariables = (yamlObject, variables, templateName) => {
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

const applyTemplate = (block, templateObject, parent) => {
    // defines all available variables to be injected
    // at build time in the GraphQL queries
    const variables = {
        filters: {}, // this wil be injected into the GraphQL query, so it should be a string
        options: {}, // this wil be injected into the GraphQL query, so it should be a string
        facet: 'null',
        ...(parent ? { parentId: parent.id } : {}),
        ...(templateObject.defaultVariables || {}),
        ...globalVariables,
        id: block.id,
        fieldId: block.id,
        ...(block.variables || {}),
        ...(block.pageVariables || {})
    }

    const populatedTemplate = injectVariables(templateObject, variables, templateObject.name)

    return {
        ...populatedTemplate,
        ...block
    }
}

const flattenSitemap = (stack, pages, parent, pageIndex) => {
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

exports.pageFromConfig = async (page, pageIndex) => {
    try {
        const { parent } = page
        // if template has been provided, apply it
        if (page.template) {
            const template = await loadTemplate(page.template)
            page = applyTemplate(page, template, parent)
        }

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
            const blocks = []
            for (const block of page.blocks) {
                // everything that's not in block.variants is part of the main block
                const { variants: variants_ = [], ...mainBlockConfig } = block
                const blockVariants = [{ ...mainBlockConfig, isMainBlock: true }, ...variants_]

                const blockPath = `${page.path}${block.id}/`

                const variants = []

                for (let blockVariant of blockVariants) {
                    // if template has been provided, apply it

                    // if block has variables, inject them based on current page and global variables
                    if (blockVariant.variables) {
                        blockVariant.variables = injectVariables(blockVariant.variables, {
                            ...page,
                            ...globalVariables
                        })
                    }

                    // also pass page variables to block so it can inherit them
                    if (page.variables) {
                        blockVariant.pageVariables = injectVariables(page.variables, {
                            ...page,
                            ...globalVariables
                        })
                    }

                    if (blockVariant.template) {
                        const template = await loadTemplate(blockVariant.template)
                        blockVariant = applyTemplate(blockVariant, template, page)
                    }

                    // if block type is missing, get it from parent
                    if (!blockVariant.blockType) {
                        blockVariant.blockType = page.defaultBlockType
                    }

                    blockVariant.path = blockVariant.isMainBlock
                        ? blockPath
                        : blockPath + `${blockVariant.id}/`

                    variants.push(blockVariant)
                }

                blocks.push({ id: block.id, variants })
            }

            page.blocks = blocks
        }
        return page
    } catch (error) {
        console.log('// pageFromConfig Error')
        console.log(error)
    }
}

let computedSitemap = null

exports.computeSitemap = async rawSitemap => {
    if (computedSitemap !== null) {
        return computedSitemap
    }

    const stack = {
        flat: []
    }

    flattenSitemap(stack, rawSitemap, undefined, 0)

    stack.flat = await Promise.all(
        stack.flat.map((page, pageIndex) => exports.pageFromConfig(page, pageIndex))
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
