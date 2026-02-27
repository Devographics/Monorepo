import get from 'lodash/get'
import { BlockVariantDefinition, PageContextValue, StringTranslator } from 'core/types'
import { Entity } from '@devographics/types'
import { MultiKeysStringTranslator, MultiStringKeys } from '@devographics/i18n'
import { getSiteTitle } from './pageHelpers'
import { useI18n } from '@devographics/react-i18n'
import { useEntities } from 'core/helpers/entities'
import { usePageContext } from 'core/helpers/pageContext'
import { removeDoubleSlashes } from './utils'

export const replaceOthers = (s: string) => s?.replace('_others', '.others')

export const getBlockNamespace = ({ block }: { block: BlockVariantDefinition }) => {
    if (block.template === 'feature_experience') {
        return 'features'
    } else if (block.template === 'tool_experience') {
        return 'tools'
    } else {
        return block.i18nNamespace || block.sectionId
    }
}

export const getBlockKey = ({ block }: { block: BlockVariantDefinition }) => {
    // const namespace = getBlockNamespace({ block })
    const blockId = block?.fieldId || block?.id
    return `${block.sectionId}.${blockId}`
}

export const getBlockTabKey = ({
    block,
    pageContext,
    variantIndex
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    variantIndex: number
}) =>
    block.tabId
        ? block.tabId
        : variantIndex === 0
        ? 'tabs.all_respondents'
        : getBlockTitleKey({ block, pageContext })

export const getBlockTabTitle = ({
    block,
    pageContext,
    variantIndex,
    getString,
    getFallbacks,
    entities
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    variantIndex: number
    getString: StringTranslator
    getFallbacks: MultiKeysStringTranslator
    entities: Entity[]
}) => {
    let key,
        label = key
    if (block.tabId) {
        key = block.tabId
        label = getString(block.tabId)?.t || block.tabId
    } else if (variantIndex === 0) {
        key = 'tabs.all_respondents'
        label = getString(key)?.t
    } else {
        // todo: "facet" has been renamed to "axis2" for consistency with
        // todo: API, but it would also need to be renamed in all the YAML configs
        const facetBlock = {
            id: block.filtersState?.axis2?.id || block.filtersState?.facet?.id,
            sectionId: block.filtersState?.axis2?.sectionId || block.filtersState?.facet?.sectionId
        } as BlockVariantDefinition

        const { key: facetKey, tClean: facetTitle } = getBlockTitle({
            block: facetBlock,
            pageContext,
            getFallbacks,
            entities
        })

        if (facetTitle) {
            key = 'charts.vs'
            label = getString(key)?.t + ' ' + facetTitle
        } else {
            key = getBlockTitleKey({ block, pageContext })
            label = getString(key)?.t
        }
    }
    return { key, label }
}

export const getBlockNote = ({
    block,
    pageContext,
    getFallbacks
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getFallbacks: MultiKeysStringTranslator
}) => {
    const { currentEdition } = pageContext
    const blockKey = getBlockKey({ block })
    const keys = [block.noteKey, `${blockKey}.note.${currentEdition.id}`, `${blockKey}.note`]
    return getFallbacks(keys)
}

export const getBlockTitleKey = ({
    block
}: {
    block: BlockVariantDefinition
    pageContext?: PageContextValue
}) => block.titleId || getBlockKey({ block })

export const getBlockTitleKeys = (options: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getFallbacks: MultiKeysStringTranslator
    entities?: Entity[]
    useShortLabel?: boolean
}) => {
    const { block, pageContext, entities, getFallbacks, useShortLabel = false } = options

    const blockKey = getBlockKey({ block })
    const blockKey_ = useShortLabel ? `${blockKey}.short` : blockKey

    const fieldKey = getBlockKey({
        block: { ...block, i18nNamespace: block.sectionId, id: block.fieldId || block.id }
    })

    const keys: MultiStringKeys = [block.titleKey, block.titleId, blockKey_, block.tabId, fieldKey]

    const entity = entities?.find(e => e.id === block.id)
    if (entity?.name) {
        keys.push(() => ({
            t: entity.name,
            tClean: entity.nameClean,
            tHtml: entity.nameHtml,
            key: `entity__${block.id}`,
            locale: pageContext.locale
        }))
    }
    return keys
}

export const getBlockTitle = (options: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getFallbacks: MultiKeysStringTranslator
    entities?: Entity[]
    useShortLabel?: boolean
}) => {
    const keys = getBlockTitleKeys(options)
    const result = options.getFallbacks(keys)
    return result
}

export const useBlockTitle = ({ block }: { block: BlockVariantDefinition }) => {
    const { getFallbacks } = useI18n()
    const entities = useEntities()
    const pageContext = usePageContext()
    return getBlockTitle({ block, pageContext, getFallbacks, entities })
}

export const useBlockTitleKeys = ({ block }: { block: BlockVariantDefinition }) => {
    const { getFallbacks } = useI18n()
    const entities = useEntities()
    const pageContext = usePageContext()
    return getBlockTitleKeys({ block, pageContext, getFallbacks, entities })
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
    getFallbacks,
    values,
    options
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getFallbacks: MultiKeysStringTranslator
    values?: any
    options?: {
        isHtml?: boolean
    }
}) => {
    const descriptionKey = `${getBlockKey({ block })}.description`
    const { currentEdition } = pageContext
    const keys = [block.descriptionId, `${descriptionKey}.${currentEdition.id}`, descriptionKey]
    const result = getFallbacks(keys, values)
    return result
}

export const useBlockDescription = ({
    block,
    values,
    options
}: {
    block: BlockVariantDefinition
    values?: any
    options?: {
        isHtml?: boolean
    }
}) => {
    const { getFallbacks } = useI18n()
    const pageContext = usePageContext()
    return getBlockDescription({ block, pageContext, getFallbacks, values, options })
}

export const getBlockQuestion = ({
    block,
    getString
}: {
    block: BlockVariantDefinition
    getString: StringTranslator
}) => {
    const blockQuestion = block.questionKey && getString(block.questionKey)?.t
    const questionKey = `${getBlockKey({ block })}.question`
    const translation = getString(questionKey)
    return blockQuestion || translation?.tClean || translation?.t
}

export const useBlockQuestion = ({ block }: { block: BlockVariantDefinition }) => {
    const { getString } = useI18n()
    return getBlockQuestion({ block, getString })
}

export const getBlockImage = ({
    block,
    pageContext
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
}) => {
    const capturesUrl = `${process.env.GATSBY_ASSETS_URL}/captures/${pageContext.currentEdition.id}`
    return `${capturesUrl}/${get(pageContext, 'locale.id')}/${block.id}.png`
}

interface UrlParams {
    surveyId: string
    editionId: string
    blockId: string
    sectionId: string
    subSectionId: string
    params: string
}

interface GetBlockLinkProps {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    params?: any
    useRedirect?: boolean
}

// get "local" block link to a pre-generated static block page
export const getBlockLinkLocal = ({
    block,
    pageContext,
    params,
    useRedirect = true
}: GetBlockLinkProps) => {
    const { id } = block
    const paramsString = params ? `?${new URLSearchParams(params).toString()}` : ''
    const { currentPath } = pageContext
    const fullUrl = pageContext.currentEdition.resultsUrl + currentPath
    let path = useRedirect ? `${fullUrl}/${id}${paramsString}` : `${fullUrl}/${paramsString}#${id}`

    // remove any double slashes
    path = removeDoubleSlashes(path)
    return path
}

// get "remote" block link to the separate Charts Next.js app
export const getBlockLinkRemote = ({
    block,
    pageContext,
    params,
    useRedirect = true
}: GetBlockLinkProps) => {
    const { id: sectionId, parent, currentEdition, currentSurvey, localeId } = pageContext
    const blockParamsString = new URLSearchParams(params).toString()

    // let path = useRedirect
    //     ? `${pageContext.currentPath}/${id}?${paramsString}`
    //     : `${pageContext.currentPath}/?${paramsString}#${id}`

    const urlParams: { [key in string]: string } = {
        localeId,
        surveyId: currentSurvey.id,
        editionId: currentEdition.id,
        blockId: block.id,
        params: blockParamsString
    }

    if (parent) {
        urlParams.sectionId = parent.id
        urlParams.subSectionId = sectionId
    } else {
        urlParams.sectionId = sectionId
    }

    const urlParamsString = new URLSearchParams(urlParams).toString()

    const url = `https://share.devographics.com/share/prerendered?${urlParamsString}`
    // remove any double slashes
    // path = path.replaceAll('//', '/')
    // const link = `${pageContext.host}${path}`
    return url
}
export const getBlockLink = (props: GetBlockLinkProps) => {
    const { pageContext } = props
    const { config } = pageContext
    const { generateBlocks = false } = config
    if (generateBlocks) {
        return getBlockLinkLocal(props)
    } else {
        return getBlockLinkRemote(props)
    }
}

export const getBlockMeta = ({
    block,
    pageContext,
    getString,
    getFallbacks,
    title: title_
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    getFallbacks: MultiKeysStringTranslator
    title?: string
}) => {
    const { id } = block
    const link = getBlockLink({ block, pageContext })
    const { currentEdition } = pageContext
    const { year, hashtag } = currentEdition
    const trackingId = `${pageContext.currentPath}${id}`.replace(/^\//, '')

    const { tClean: blockTitle } = getBlockTitle({ block, pageContext, getFallbacks })
    const title = title_ || blockTitle

    const subtitle = getBlockDescription({ block, pageContext, getFallbacks })

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
