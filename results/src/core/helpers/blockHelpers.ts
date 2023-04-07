import get from 'lodash/get'
import { BlockDefinition, PageContextValue } from 'core/types'
import { Entity } from '@devographics/types'
import { getSiteTitle } from './pageHelpers'

export const replaceOthers = s => s?.replace('_others', '.others')

export const getBlockKey = (block: BlockDefinition) => {
    const namespace = block.sectionId
    const blockId = replaceOthers(block?.id)
    return `${namespace}.${blockId}`
}

export const getBlockTabKey = (block: BlockDefinition, page: PageContextValue, variantIndex) =>
    block.tabId
        ? block.tabId
        : variantIndex === 0
        ? 'tabs.all_respondents'
        : getBlockTitleKey(block, page)

export const getBlockNoteKey = (block: BlockDefinition, page: PageContextValue) =>
    block.noteId || `${getBlockKey(block)}.note`

export const getBlockTitleKey = (block: BlockDefinition, page: PageContextValue) =>
    block.titleId || `${getBlockKey(block)}`

export const getBlockDescriptionKey = (block: BlockDefinition, page: PageContextValue) =>
    block.descriptionId || `${getBlockKey(block)}.description`

export const getBlockTitle = (
    block: BlockDefinition,
    page: PageContextValue,
    translate: any,
    entities?: Entity[]
) => {
    const entity = entities?.find(e => e.id === block.id)
    const translation = translate(
        getBlockTitleKey(block, page),
        {},
        entity?.nameClean || entity?.name
    )
    const title = block.title || translation
    return title
}

export const getBlockDescription = (block, page, translate) => {
    return block.description || translate(`${getBlockDescriptionKey(block, page)}`, {}, null)
}

export const getBlockImage = (block, context) => {
    const capturesUrl = `https://assets.devographics.com/captures/${context.currentEdition.id}`
    return `${capturesUrl}${get(context, 'locale.path')}/${block.id}.png`
}

export const getBlockLink = ({ block, context, params, useRedirect = true }) => {
    const { id } = block
    const paramsString = new URLSearchParams(params).toString()

    let path = useRedirect
        ? `${context.currentPath}/${id}?${paramsString}`
        : `${context.currentPath}/?${paramsString}#${id}`

    // remove any double slashes
    path = path.replaceAll('//', '/')
    const link = `${context.host}${path}`
    return link
}

export const getBlockMeta = (
    block: BlockDefinition,
    context: PageContextValue,
    translate,
    title
) => {
    const { id } = block
    const link = getBlockLink({ block, context })
    const { currentEdition } = context
    const { year, hashtag } = currentEdition
    const trackingId = `${context.currentPath}${id}`.replace(/^\//, '')

    title = title || getBlockTitle(block, context, translate)

    const subtitle = getBlockDescription(block, context, translate)

    const imageUrl = getBlockImage(block, context, translate)

    const values = {
        title,
        link,
        hashtag,
        year,
        siteTitle: getSiteTitle(context)
    }

    const twitterText = translate('share.block.twitter_text', {
        values
    })
    const emailSubject = translate('share.block.subject', {
        values
    })
    const emailBody = translate('share.block.body', {
        values
    })

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
