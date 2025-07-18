import get from 'lodash/get'
import { getBlockImage } from './blockHelpers'
import { PageContextValue } from 'core/types'
import { StringTranslator } from '@devographics/react-i18n'

// TODO: doesn't seem to be used
export const getTranslationValuesFromContext = (
    context: { section?: string; tool?: string },
    translate: (key: string) => string
) => {
    const values: { section?: string; tool?: string } = {}
    if (context.section !== undefined) {
        values.section = translate(`section.${context.section}`)
    }
    if (context.tool !== undefined) {
        // values.tool = getToolName(context.tool, translate)
        values.tool = 'todo'
    }

    return values
}

export const getPageLabelKey = ({ pageContext }: { pageContext: PageContextValue }): string =>
    pageContext.titleId || `sections.${pageContext.intlId || pageContext.id}.title`

export const getPageLabel = ({
    pageContext,
    getString,
    options = { includeWebsite: false }
}: {
    pageContext: PageContextValue
    getString: StringTranslator
    options?: { includeWebsite?: boolean }
}) => {
    const defaultKey = getPageLabelKey({ pageContext })

    let label,
        key = defaultKey

    const defaultTitle = getString(defaultKey)?.t
    const shortKey = `${defaultKey}.short`
    const shortTitle = getString(shortKey)?.t

    if (shortTitle) {
        key = shortKey
        label = shortTitle
    } else if (defaultTitle) {
        key = defaultKey
        label = defaultTitle
    }
    if (options.includeWebsite === true) {
        label = `${pageContext.currentSurvey.name} ${pageContext.currentEdition.year}: ${label}`
    }

    return { key, label }
}

/**
 * example:
 *   http://2018.stateofjs.com/images/captures/en-US/front-end_overview.png
 */
export const getPageImageUrl = ({ pageContext }: { pageContext: PageContextValue }) => {
    const { currentEdition, block } = pageContext
    // TODO: seems to happen in dev?
    if (!currentEdition) return ''

    let imageUrl
    if (block !== undefined) {
        imageUrl = getBlockImage({ block, pageContext })
    } else {
        imageUrl =
            currentEdition?.socialImageUrl ||
            `${process.env.GATSBY_ASSETS_URL}/surveys/${currentEdition.id}-og.png`
    }

    return imageUrl
}

export const getSiteTitle = ({ pageContext }: { pageContext: PageContextValue }) =>
    `${pageContext.currentSurvey.name} ${pageContext.currentEdition.year}`

export const getPageMeta = ({
    pageContext,
    getString,
    overrides = {}
}: {
    pageContext: PageContextValue
    getString: StringTranslator
    overrides: any
}) => {
    const url = `${pageContext.host}${get(pageContext, 'locale.path')}${pageContext.basePath}`
    const imageUrl = getPageImageUrl({ pageContext })
    const isRoot = pageContext.path === '/' || pageContext.basePath === '/'

    const meta = {
        url,
        title: isRoot
            ? getSiteTitle({ pageContext })
            : getPageLabel({ pageContext, getString, options: { includeWebsite: true } }).label,
        imageUrl,
        ...overrides
    }

    return meta
}

export const getPageSocialMeta = ({
    pageContext,
    getString,
    overrides = {}
}: {
    pageContext: PageContextValue
    getString: StringTranslator
    overrides: any
}) => {
    const meta = getPageMeta({ pageContext, getString, overrides })
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
export const mergePageContext = (pageContext: PageContextValue, location: any, state: any = {}) => {
    const isCapturing =
        location && location.search ? location.search.indexOf('capture') !== -1 : false
    const isRawChartMode =
        location && location.search ? location.search.indexOf('raw') !== -1 : false
    const isDebugEnabled =
        location && location.search ? location.search.indexOf('debug') !== -1 : false

    let host = pageContext?.currentEdition?.resultsUrl
    if (location && location.host && location.protocol) {
        host = `${location.protocol}//${location.host}`
    }

    const context = {
        ...pageContext,
        host,
        currentPath: location ? location.pathname : undefined,
        isCapturing,
        isRawChartMode,
        isDebugEnabled,
        ...state
    }
    return context
}
