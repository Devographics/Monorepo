/**
 * Utilities to compute the relevant metadata for a block
 * (except the image URL, which depends on the generator used)
 * 
 * A block = a given charts like browsees used by respondants
 * 
 * Adapted from results/src/core/helpers/blockHelpers.ts
 */

// TODO: handle those types that come from the Gatsby app
// import { PageContextValue, StringTranslator } from 'core/types'
// import { getSiteTitle } from './pageHelpers'

// TODO: enable shared folders
import { Entity } from '@devographics/types'
import { BlockDefinition } from "./typings"

export const replaceOthers = (s: string) => s?.replace('_others', '.others')

/**
 * "section.question"
 * @example environment.browsers
 */
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

const getBlockTitleKey = ({
    block
}: {
    block: BlockDefinition
    pageContext: PageContextValue
}) => block.titleId || `${getBlockKey({ block })}`

const getBlockTitle = ({
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


/*

In order of priority, use:

1. an id explicitly defined as the block's definitionId
2. a description for the specific edition (e.g. user_info.age.description.js2022)
3. a generic description key (e.g. user_info.age.description.js2022)

*/
const getBlockDescription = ({
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


/**
 * TODO: this URL should be replaced by the URL generated on the fly
 */
/*
export const getBlockImage = ({
    block,
    pageContext
}: {
    block: BlockDefinition
    pageContext: PageContextValue
}) => {
    const capturesUrl = `https://assets.devographics.com/captures/${pageContext.currentEdition.id}`
    return `${capturesUrl}${pageContext.locale.path}/${block.id}.png`
}
*/

const getBlockLink = ({
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

    // TODO: in this app it should be already provided
    // const imageUrl = getBlockImage({ block, pageContext })

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
        //imageUrl
    }
}

/**
 * Get all possible charts from the sitemap
 * Is it needed here? Instead we may want to detect valid blocks based on the survey outline
 * @param sitemap 
 * @returns 
 */
/*
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
*/