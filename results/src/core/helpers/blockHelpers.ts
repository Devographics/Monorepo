import get from 'lodash/get'
import { BlockDefinition, PageContextValue, StringTranslator } from 'core/types'
import { Entity } from '@devographics/types'
import { getSiteTitle } from './pageHelpers'
import { useI18n } from 'core/i18n/i18nContext'
import { useEntities } from 'core/helpers/entities'
import { usePageContext } from 'core/helpers/pageContext'

export const replaceOthers = s => s?.replace('_others', '.others')

export const getBlockKey = ({ block }: { block: BlockDefinition }) => {
    let namespace = block.sectionId
    if (block.template === 'feature_experience') {
        namespace = 'features'
    }
    if (block.template === 'tool_experience') {
        namespace = 'tools'
    }
    const blockId = replaceOthers(block?.id)
    return `${namespace}.${blockId}`
}

export const getBlockTabKey = ({
    block,
    pageContext,
    variantIndex
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    variantIndex: number
}) =>
    block.tabId
        ? block.tabId
        : variantIndex === 0
            ? 'tabs.all_respondents'
            : getBlockTitleKey({ block, pageContext })

export const getBlockNoteKey = ({ block }: { block: BlockDefinition }) =>
    block.noteId || `${getBlockKey({ block })}.note`

export const getBlockTitleKey = ({
    block
}: {
    block: BlockDefinition
    pageContext: PageContextValue
}) => block.titleId || `${getBlockKey({ block })}`

export const getBlockTitle = ({
    block,
    pageContext,
    getString,
    entities
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    entities?: Entity[]
}) => {
    const entity = entities?.find(e => e.id === block.id)
    const entityName = entity?.nameClean || entity?.name
    const blockTitle = block.titleId && getString(block.titleId)?.t
    const key = getBlockTitleKey({ block, pageContext })

    const translation = getString(key)
    return blockTitle || translation?.tClean || translation?.t || entityName || key
}

export const useBlockTitle = ({ block }: { block: BlockDefinition }) => {
    const { getString } = useI18n()
    const entities = useEntities()
    const pageContext = usePageContext()
    return getBlockTitle({ block, pageContext, getString, entities })
}

/*

In order of priority, use:

1. an id explicitly defined as the block's definitionId
2. a description for the specific edition (e.g. user_info.age.description.js2022)
3. a generic description key (e.g. user_info.age.description.js2022)

*/
export const getBlockDescription = ({
    block,
    pageContext,
    getString,
    values,
    options
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    values?: any
    options?: {
        isHtml?: boolean
    }
}) => {
    const descriptionKey = `${getBlockKey({ block })}.description`
    const { currentEdition } = pageContext
    const blockDescription = block.descriptionId && getString(block.descriptionId, values)?.t
    const editionDescription = getString(`${descriptionKey}.${currentEdition.id}`, values)?.t
    const genericDescription = getString(descriptionKey, values)?.t
    return blockDescription || editionDescription || genericDescription
}

export const useBlockDescription = ({
    block,
    values,
    options
}: {
    block: BlockDefinition
    values?: any
    options?: {
        isHtml?: boolean
    }
}) => {
    const { getString } = useI18n()
    const pageContext = usePageContext()
    return getBlockDescription({ block, pageContext, getString, values, options })
}

export const getBlockQuestion = ({
    block,
    getString
}: {
    block: BlockDefinition
    getString: StringTranslator
}) => {
    const questionKey = `${getBlockKey({ block })}.question`
    return getString(questionKey)?.t
}

export const useBlockQuestion = ({ block }: { block: BlockDefinition }) => {
    const { getString } = useI18n()
    return getBlockQuestion({ block, getString })
}

export const getBlockImage = ({
    block,
    pageContext
}: {
    block: BlockDefinition
    pageContext: PageContextValue
}) => {
    const capturesUrl = `https://assets.devographics.com/captures/${pageContext.currentEdition.id}`
    return `${capturesUrl}${get(pageContext, 'locale.path')}/${block.id}.png`
}

export const getBlockLink = ({
    block,
    pageContext,
    params,
    useRedirect = true
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    params?: any
    useRedirect?: boolean
}) => {
    const { id } = block
    const paramsString = new URLSearchParams(params).toString()

    let path = useRedirect
        ? `${pageContext.currentPath}/${id}?${paramsString}`
        : `${pageContext.currentPath}/?${paramsString}#${id}`

    // remove any double slashes
    path = path.replaceAll('//', '/')
    const link = `${pageContext.host}${path}`
    return link
}

export const getBlockMeta = ({
    block,
    pageContext,
    getString,
    title
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    title?: string
}) => {
    const { id } = block
    const link = getBlockLink({ block, pageContext })
    const { currentEdition } = pageContext
    const { year, hashtag } = currentEdition
    const trackingId = `${pageContext.currentPath}${id}`.replace(/^\//, '')

    title = title || getBlockTitle({ block, pageContext, getString })

    const subtitle = getBlockDescription({ block, pageContext, getString })

    const imageUrl = getBlockImage({ block, pageContext })

    const values = {
        title,
        link,
        hashtag,
        year,
        siteTitle: getSiteTitle({ pageContext })
    }

    const twitterText = getString('share.block.twitter_text', {
        values
    })?.t
    const emailSubject = getString('share.block.subject', {
        values
    })?.t
    const emailBody = getString('share.block.body', {
        values
    })?.t

    return {
        link,
        trackingId,
        title,
        subtitle,
        twitterText,
        emailSubject,
        emailBody,
        imageUrl
    }
}

export const getAllBlocks = sitemap => {
    let allBlocks = []
    sitemap.contents.forEach(page => {
        allBlocks = [...allBlocks, ...page.blocks]
        if (page.children) {
            page.children.forEach(page => {
                allBlocks = [...allBlocks, ...page.blocks]
            })
        }
    })
    return allBlocks
}
