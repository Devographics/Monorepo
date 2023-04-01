import get from 'lodash/get'
import config from 'Config/config.yml'
import { BlockDefinition } from 'core/types'
import { Entity } from '@devographics/types'

const { siteTitle, capturesUrl, hashtag, year } = config

export const replaceOthers = s => s?.replace('_others', '.others')

export const getBlockKey = (block: BlockDefinition) => {
    const namespace = block.sectionId
    const blockId = replaceOthers(block?.id)
    return `${namespace}.${blockId}`
}

export const getBlockTabKey = (block, page, variantIndex) =>
    block.tabId
        ? block.tabId
        : variantIndex === 0
        ? 'tabs.all_respondents'
        : getBlockTitleKey(block, page)

export const getBlockNoteKey = (block, page) => block.noteId || `${getBlockKey(block, page)}.note`

export const getBlockTitleKey = (block, page) => block.titleId || `${getBlockKey(block, page)}`

export const getBlockDescriptionKey = (block, page) =>
    block.descriptionId || `${getBlockKey(block, page)}.description`

export const getBlockTitle = (
    block: BlockDefinition,
    page: any,
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

export const getBlockMeta = (block, context, translate, title) => {
    const { id } = block
    const link = getBlockLink({ block, context })

    const trackingId = `${context.currentPath}${id}`.replace(/^\//, '')

    title = title || getBlockTitle(block, context, translate)

    const subtitle = getBlockDescription(block, context, translate)

    const imageUrl = getBlockImage(block, context, translate)

    const values = {
        title,
        link,
        hashtag,
        year,
        siteTitle
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
