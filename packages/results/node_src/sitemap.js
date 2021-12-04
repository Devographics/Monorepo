const fs = require('fs')
const { findIndex, findLastIndex, omit, template } = require('lodash')
const yaml = require('js-yaml')
const { getAllBlocks, loadTemplate } = require('./helpers.js')

const rawPageTemplates = fs.readFileSync(
    `./surveys/${process.env.SURVEY}/config/page_templates.yml`,
    'utf8'
)
const rawBlockTemplates = fs.readFileSync(
    `./surveys/${process.env.SURVEY}/config/block_templates.yml`,
    'utf8'
)
const globalVariables = yaml.load(
    fs.readFileSync(`./surveys/${process.env.SURVEY}/config/variables.yml`, 'utf8')
)

const injectVariables = (yamlObject, variables, templateName) => {
    try {
        // convert template object back to string for variables injection
        const templateString = yaml.dump(yamlObject)
        // Inject variables in raw yaml templates
        const interpolatedTemplate = template(templateString)(variables)
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
        filters: '{}', // this wil be injected into the GraphQL query, so it should be a string
        options: '{}', // this wil be injected into the GraphQL query, so it should be a string
        facet: 'null',
        ...(parent ? { parentId: parent.id } : {}),
        ...(templateObject.defaultVariables || {}),
        ...globalVariables,
        id: block.id,
        fieldId: block.id,
        ...(block.variables || {}),
        ...(block.pageVariables || {}),
    }

    const populatedTemplate = injectVariables(templateObject, variables, templateObject.name)

    return {
        ...populatedTemplate,
        ...block,
    }
}

exports.pageFromConfig = async (stack, item, parent, pageIndex) => {
    try {
        // if template has been provided, apply it
        if (item.template) {
            const template = await loadTemplate(item.template)

            item = applyTemplate(item, template, parent)
        }

        const pagePath = item.path || `/${item.id}`
        const page = {
            ...item,
            path: parent === undefined ? pagePath : `${parent.path.replace(/\/$/, '')}${pagePath}`,
            is_hidden: !!item.is_hidden,
            children: [],
            pageIndex,
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
                            ...item,
                            ...globalVariables,
                        })
                    }

                    // also pass page variables to block so it can inherit them
                    if (page.variables) {
                        blockVariant.pageVariables = injectVariables(page.variables, {
                            ...item,
                            ...globalVariables,
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

        if (parent === undefined) {
            stack.hierarchy.push(page)
        }
        stack.flat.push(page)

        if (Array.isArray(item.children)) {
            item.children.forEach(async (child) => {
                const pageChild = await exports.pageFromConfig(stack, child, page, pageIndex)
                page.children.push(pageChild)
            })
        }

        return page
    } catch (error) {
        console.log('// pageFromConfig Error')
        console.log(error)
    }
}

let computedSitemap = null

exports.computeSitemap = async (rawSitemap, locales) => {
    if (computedSitemap !== null) {
        return computedSitemap
    }

    const stack = {
        flat: [],
        hierarchy: [],
    }

    let pageIndex = 0
    for (const item of rawSitemap) {
        await exports.pageFromConfig(stack, item, undefined, pageIndex)
        pageIndex++
    }

    // assign prev/next page using flat pages
    stack.flat.forEach((page) => {
        // if the page is hidden, do not generate pagination for it
        if (page.is_hidden) return

        const index = findIndex(stack.flat, (p) => p.path === page.path)
        const previous = stack.flat[index - 1]

        // we exclude hidden pages from pagination
        if (previous !== undefined && previous.is_hidden !== true) {
            page.previous = omit(previous, ['is_hidden', 'previous', 'next', 'children', 'blocks'])
        }

        const lastIndex = findLastIndex(stack.flat, (p) => p.path === page.path)
        const next = stack.flat[lastIndex + 1]

        // we exclude hidden pages from pagination
        if (next !== undefined && next.is_hidden !== true) {
            page.next = omit(next, ['is_hidden', 'previous', 'next', 'children', 'blocks'])
        }
    })

    const now = new Date()
    const sitemapContent = [
        `###################################################################`,
        `# DO NOT EDIT`,
        `###################################################################`,
        `# this file was generated by \`gatsby-node.js\``,
        `# please edit \`raw_sitemap.yaml\` instead.`,
        `# generated on: ${now.toISOString()}`,
        `###################################################################`,
        yaml.dump({ locales, contents: stack.hierarchy }, { noRefs: true }),
    ].join('\n')
    await fs.writeFileSync(`./surveys/${process.env.SURVEY}/config/sitemap.yml`, sitemapContent)
    await fs.writeFileSync(
        `./surveys/${process.env.SURVEY}/config/blocks.yml`,
        yaml.dump(getAllBlocks({ contents: stack.hierarchy }), { noRefs: true })
    )

    return stack
}
