import get from 'lodash/get'
import config from 'Config/config.yml'

const { siteTitle, capturesUrl, hashtag, year } = config

export const replaceOthers = s => s?.replace('_others', '.others')

export const getBlockKey = (block, page) => {
    const namespace = block.i18nNamespace ?? 'blocks'
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

export const getBlockTitleKey = (block, page) => replaceOthers(block.titleId) || `${getBlockKey(block, page)}`

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
