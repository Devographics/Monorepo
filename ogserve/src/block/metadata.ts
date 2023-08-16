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
import { EditionMetadata, Entity, SurveyMetadata } from '@devographics/types'
import { BlockDefinition } from "./typings"
import type { StringTranslator } from "../i18n"


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
    currentEdition,
    getString,
    values,
    // options
}: {
    block: BlockDefinition
    getString: StringTranslator
    // in the Gatsby result app this is provided by the page context
    currentEdition: EditionMetadata,
    values?: any
    /*
    options?: {
        isHtml?: boolean
    }*/
}) => {
    const descriptionKey = `${getBlockKey({ block })}.description`
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

/**
 * Redirection link associated with a chart
 * => points to the chart in the context of the survey
 * @param param0 
 * @returns 
 */
const getBlockLink = ({
    block,
    currentPath,
    host,
    params,
    useRedirect = true
}: {
    block: BlockDefinition
    /** TODO: in the Gatsby app its "pageContext.currentPath" but we have no currentPath, can we derive it from the block definition? */
    currentPath: string,
    /** TODO: this is the result app URL, how to get it reliably? From the edition definition? */
    host: string,
    // pageContext: PageContextValue
    params?: any
    useRedirect?: boolean
}) => {
    const { id } = block
    const paramsString = new URLSearchParams(params).toString()

    let path = useRedirect
        ? `${currentPath}/${id}?${paramsString}`
        : `${currentPath}/?${paramsString}#${id}`

    // remove any double slashes
    // @ts-ignore TODO: setting lib to ES2021 in tsconfig will make "fetch" being unreckognized in Node code
    path = path.replaceAll('//', '/')
    const link = `${host}${path}`
    return link
}

function getSiteTitle({ currentEdition }: { currentEdition: EditionMetadata }) {
    return `${currentEdition.survey.name} ${currentEdition.year}`
}

export const getBlockMeta = ({
    block,
    getString,
    currentEdition,
    currentPath,
    host,
    title
}: {
    block: BlockDefinition
    currentEdition: EditionMetadata,
    currentPath: string,
    host: string,
    getString: StringTranslator
    title?: string
}) => {
    const { id } = block
    const link = getBlockLink({ block, currentPath, host })
    // TODO: what is hashtag now?
    const { year/*, hashtag*/ } = currentEdition
    const trackingId = `${currentPath}${id}`.replace(/^\//, '')

    title = title || getBlockTitle({ block, getString })

    const subtitle = getBlockDescription({ block, currentEdition, getString })

    // TODO: in this app it should be already provided
    // const imageUrl = getBlockImage({ block, pageContext })

    const values = {
        title,
        link,
        // hashtag,
        year,
        siteTitle: getSiteTitle({ currentEdition })
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