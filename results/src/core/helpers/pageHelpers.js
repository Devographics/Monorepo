import { getToolName } from 'core/helpers/tools'
import get from 'lodash/get'
import config from 'Config/config.yml'
import { getBlockImage } from './blockHelpers'

export const getTranslationValuesFromContext = (context, translate) => {
    const values = {}
    if (context.section !== undefined) {
        values.section = translate(`section.${context.section}`)
    }
    if (context.tool !== undefined) {
        values.tool = getToolName(context.tool, translate)
    }

    return values
}

export const getPageLabelKey = page => page.titleId || `sections.${page.intlId || page.id}.title`

export const getPageLabel = (page, translate, { includeWebsite = false } = {}) => {
    let label

    label = translate(getPageLabelKey(page))

    if (includeWebsite === true) {
        label = `${config.siteTitle}: ${label}`
    }

    return label
}

/**
 * example:
 *   http://2018.stateofjs.com/images/captures/en-US/front-end_overview.png
 */
export const getPageImageUrl = context => {
    const { currentEdition, block } = context

    let imageUrl
    if (block !== undefined) {
        imageUrl = getBlockImage(block, context)
    } else {
        imageUrl = currentEdition.socialImageUrl
    }

    return imageUrl
}

export const getPageMeta = (context, translate, overrides = {}) => {
    const url = `${context.host}${get(context, 'locale.path')}${context.basePath}`
    const imageUrl = getPageImageUrl(context)
    const isRoot = context.path === '/' || context.basePath === '/'

    const meta = {
        url,
        title: isRoot
            ? config.siteTitle
            : getPageLabel(context, translate, { includeWebsite: true }),
        imageUrl,
        ...overrides
    }

    return meta
}

export const getPageSocialMeta = (context, translate, overrides = {}) => {
    const meta = getPageMeta(context, translate, overrides)
    const socialMeta = [
        // facebook
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: meta.url },
        { property: 'og:image', content: meta.imageUrl },
        { property: 'og:title', content: meta.title },
        { property: 'og:description', content: meta.description },
        // twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image:src', content: meta.imageUrl },
        { name: 'twitter:title', content: meta.title },
        { name: 'twitter:description', content: meta.description }
    ]

    return socialMeta.filter(({ content }) => content !== undefined)
}

/**
 * Merge context generated from `gatsby-node` with runtime context.
 */
export const mergePageContext = (pageContext, location, state) => {
    const isCapturing =
        location && location.search ? location.search.indexOf('capture') !== -1 : false
    const isDebugEnabled =
        location && location.search ? location.search.indexOf('debug') !== -1 : false

    let host = config.siteUrl
    if (location && location.host && location.protocol) {
        host = `${location.protocol}//${location.host}`
    }

    return {
        ...pageContext,
        host,
        currentPath: location ? location.pathname : undefined,
        isCapturing,
        isDebugEnabled,
        ...state
    }
}
