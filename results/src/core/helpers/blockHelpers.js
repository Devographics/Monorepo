import get from 'lodash/get'
import config from 'Config/config.yml'

const { siteTitle, capturesUrl, hashtag, year } = config

export const getBlockKey = (block, page) => {
    if (block.blockName) {
        return `blocks.${block.blockName}`
    } else {
        const pageId = page.i18nNamespace || block.pageId || page.id
        const blockId = block?.id?.replace('_others', '.others')
        return `${pageId}.${blockId}`
    }
}

export const getBlockTabKey = (block, page) => block.tabId ? `tabs.${block.tabId}` : getBlockTitleKey(block, page)

export const getBlockNoteKey = (block, page) => block.noteId || `${getBlockKey(block, page)}.note`

export const getBlockTitleKey = (block, page) => block.titleId || getBlockKey(block, page)

export const getBlockDescriptionKey = (block, page) =>
    block.descriptionId || `${getBlockKey(block, page)}.description`

export const getBlockTitle = (block, page, translate) => {
    return block.title || translate(getBlockTitleKey(block, page))
}

export const getBlockDescription = (block, page, translate) => {
    return block.description || translate(`${getBlockDescriptionKey(block, page)}`, {}, null)
}

export const getBlockImage = (block, context) => {
    return `${capturesUrl}${get(context, 'locale.path')}/${block.id}.png`
}

export const getBlockMeta = (block, context, translate, title) => {
    const { id } = block
    const link = `${context.host}${context.currentPath}#${id}`
    const trackingId = `${context.currentPath}${id}`.replace(/^\//, '')

    title = title || getBlockTitle(block, context, translate)

    const imageUrl = getBlockImage(block, context, translate)

    const values = {
        title,
        link,
        hashtag,
        year,
        siteTitle,
    }

    const twitterText = translate('share.block.twitter_text', {
        values,
    })
    const emailSubject = translate('share.block.subject', {
        values,
    })
    const emailBody = translate('share.block.body', {
        values,
    })

    return {
        link,
        trackingId,
        title,
        twitterText,
        emailSubject,
        emailBody,
        imageUrl,
    }
}

export const getAllBlocks = (sitemap) => {
    let allBlocks = []
    sitemap.contents.forEach((page) => {
        allBlocks = [...allBlocks, ...page.blocks]
        if (page.children) {
            page.children.forEach((page) => {
                allBlocks = [...allBlocks, ...page.blocks]
            })
        }
    })
    return allBlocks
}
