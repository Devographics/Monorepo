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
import {
    BlockVariantComputed,
    BlockVariantDefinition,
    EditionMetadata,
    Entity
} from '@devographics/types'
import { PageContextValue } from './typings'
import type { StringTranslator } from '@/i18n/typings'

/**
 * "section.question"
 * @example environment.browsers
 */
export const getBlockKey = ({
    block,
    pageContext
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
}) => {
    const { id, i18nNamespace } = block
    const { sectionId } = pageContext
    let namespace = i18nNamespace || sectionId
    if (block.template === 'feature_experience') {
        namespace = 'features'
    }
    if (block.template === 'tool_experience') {
        namespace = 'tools'
    }
    return `${namespace}.${id}`
}

const getBlockTitleKey = ({
    block,
    pageContext
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
}) => block.titleId || getBlockKey({ block, pageContext })

const getBlockTitle = ({
    block,
    pageContext,
    getString
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
}) => {
    const entity = block?.entity
    const entityName = entity?.nameClean || entity?.name
    const key = getBlockTitleKey({ block, pageContext })
    const translation = getString(key)
    return translation?.tClean || translation?.t || entityName
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
    values
}: // options
{
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    values?: any
    /*
    options?: {
        isHtml?: boolean
    }*/
}) => {
    const key = block.descriptionId || `${getBlockKey({ block, pageContext })}.description`
    const translation = getString(key)
    return translation?.tClean || translation?.t
}

/**
 * Redirection link associated with a chart
 * => points to the chart in the context of the survey
 * @param param0
 * @returns
 */
const getBlockLink = ({
    block,
    pageContext,
    useRedirect = true
}: {
    block: BlockVariantComputed
    pageContext: PageContextValue
    useRedirect?: boolean
}) => {
    const { id: blockId, path } = block
    const { edition, localeId } = pageContext
    const { resultsUrl } = edition
    const pathSegments = path.split('/').filter(s => s !== '')
    pathSegments.pop()
    const segments = [localeId, ...pathSegments]
    const pathname = `/${segments.join('/')}/#${blockId}`
    const url = new URL(pathname, resultsUrl)
    const link = url.toString()
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
    blockParameters,
    pageContext,
    getString
}: {
    block: BlockVariantComputed
    blockParameters: any
    pageContext: PageContextValue
    getString: StringTranslator
}) => {
    const { edition, sectionId, localeId } = pageContext
    const { year } = edition
    const link = getBlockLink({
        block,
        pageContext
    })
    // TODO: what is hashtag now?
    const trackingId = `${edition.id}/${localeId}/${sectionId}/${block.id}`.replace(/^\//, '')

    const title = getBlockTitle({ block, pageContext, getString })

    const description = getBlockDescription({ block, pageContext, getString })

    const values = {
        title,
        link,
        // hashtag,
        year,
        siteTitle: getSiteTitle({ edition })
    }

    // const twitterText = getString('share.block.twitter_text', {
    //     values
    // })?.t
    // const emailSubject = getString('share.block.subject', {
    //     values
    // })?.t
    // const emailBody = getString('share.block.body', {
    //     values
    // })?.t

    return {
        link,
        trackingId,
        title,
        description
        // twitterText,
        // emailSubject,
        // emailBody
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
