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
import { EditionMetadata, Entity } from '@devographics/types'
import { BlockDefinition } from "./typings"
import type { StringTranslator } from "@/i18n/typings"


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
}) => block.titleId || `${getBlockKey({ block })}`

const getBlockTitle = ({
    block,
    getString,
    entities
}: {
    block: BlockDefinition
    getString: StringTranslator
    entities?: Entity[]
}) => {
    const entity = entities?.find(e => e.id === block.id)
    const entityName = entity?.nameClean || entity?.name
    const blockTitle = block.titleId && getString(block.titleId)?.t
    const key = getBlockTitleKey({ block })

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
    edition,
    getString,
    values,
    // options
}: {
    block: BlockDefinition
    getString: StringTranslator
    edition: EditionMetadata,
    values?: any
    /*
    options?: {
        isHtml?: boolean
    }*/
}) => {
    const descriptionKey = `${getBlockKey({ block })}.description`
    const blockDescription = block.descriptionId && getString(block.descriptionId, values)?.t
    const editionDescription = getString(`${descriptionKey}.${edition.id}`, values)?.t
    const genericDescription = getString(descriptionKey, values)?.t
    return blockDescription || editionDescription || genericDescription
}

/**
 * Redirection link associated with a chart
 * => points to the chart in the context of the survey
 * @param param0 
 * @returns 
 */
const getBlockLink = ({
    blockId,
    section,
    editionResultUrl,
    lang = "en-US",
    useRedirect = true
}: {
    /**
     * environments
     */
    section: string,
    /**
     * browsers
     */
    blockId: string,
    /**
     * https://2021.stateofcss.com/
     */
    editionResultUrl: string,
    lang?: string,
    useRedirect?: boolean
}) => {
    // TODO: we are always in "redirect" context here?
    let link = useRedirect
        ? `${editionResultUrl}/${lang}/${section}/${blockId}`
        : `${editionResultUrl}/${lang}/#${blockId}`

    link = link.replaceAll('//', '/')
    console.log("Block link:", link, "(editionResultUrl:", editionResultUrl, ")")
    return link
}

function getSiteTitle({ edition }: { edition: EditionMetadata }) {
    return `${edition.survey.name} ${edition.year}`
}

/**
 * NOTE: block image is NOT handled here,
 * because the URL depends on the way this image is generated
 * (prerendering, on the fly, storing a filtered version...)
 * @param param0 
 * @returns 
 */
export const getBlockMeta = ({
    block,
    getString,
    edition,
    lang = "en-US",
    title
}: {
    block: BlockDefinition
    edition: EditionMetadata,
    lang?: string,
    getString: StringTranslator
    title?: string
}) => {
    const { year } = edition
    const link = getBlockLink({
        editionResultUrl: edition.resultsUrl,
        blockId: block.id,
        section: block.sectionId,
    })
    // TODO: what is hashtag now?
    const trackingId = `${lang}/${block.sectionId}${block.id}`.replace(/^\//, '')

    title = title || getBlockTitle({ block, getString })

    const subtitle = getBlockDescription({ block, edition, getString })

    const values = {
        title,
        link,
        // hashtag,
        year,
        siteTitle: getSiteTitle({ edition })
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