import get from 'lodash/get'
import { BlockVariantDefinition, PageContextValue, StringTranslator } from 'core/types'
import { Entity } from '@devographics/types'
import { getSiteTitle } from './pageHelpers'
import { useI18n } from '@devographics/react-i18n'
import { useEntities } from 'core/helpers/entities'
import { usePageContext } from 'core/helpers/pageContext'
import { removeDoubleSlashes } from './utils'
import snarkdown from 'snarkdown'

export const replaceOthers = s => s?.replace('_others', '.others')

export const getBlockKey = ({ block }: { block: BlockVariantDefinition }) => {
    let namespace = block.i18nNamespace || block.sectioni18nNamespace || block.sectionId
    if (block.template === 'feature_experience') {
        namespace = 'features'
    }
    if (block.template === 'tool_experience') {
        namespace = 'tools'
    }
    const blockId = block?.fieldId || block?.id
    return `${namespace}.${blockId}`
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
    entities
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    variantIndex: number
    getString: StringTranslator
    entities: Entity[]
}) => {
    let key, label
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

        const { key: facetKey, label: facetTitle } = getBlockTitle({
            block: facetBlock,
            pageContext,
            getString,
            entities
        })

        if (facetTitle) {
            key = 'charts.vs'
            label = getString(key)?.t + ' ' + facetTitle
        } else {
            key = getBlockTitleKey({ block, pageContext })
            label = getString(label)?.t
        }
    }
    return { key, label }
}

export const getBlockNoteKey = ({ block }: { block: BlockVariantDefinition }) =>
    block.noteId || `${getBlockKey({ block })}.note`

export const getBlockTitleKey = ({
    block
}: {
    block: BlockVariantDefinition
    pageContext?: PageContextValue
}) => block.titleId || getBlockKey({ block })

export const getBlockTitle = (options: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    entities?: Entity[]
    useShortLabel?: boolean
    useFullVersion?: boolean
}) => {
    let key, label
    const {
        block,
        pageContext,
        getString,
        entities,
        useShortLabel,
        useFullVersion = true
    } = options
    let shortTitle
    const entity = entities?.find(e => e.id === block.id)
    const entityName = entity?.nameClean || entity?.name
    const specifiedTitle = block.titleId && getString(block.titleId)?.tClean
    const defaultKey = getBlockKey({ block })
    const defaultTitle = getString(defaultKey)?.tClean

    if (useShortLabel) {
        shortTitle = getString(defaultKey + '.short')?.tClean
    }

    const fieldTitle =
        block.fieldId &&
        getString(
            getBlockKey({ block: { ...block, i18nNamespace: block.sectionId, id: block.fieldId } })
        )?.t

    // when sharing block we want full version (e.g. "Years of Experience By Salary") but
    // in other context we might not
    const tabTitle =
        block.tabId && useFullVersion
            ? `${fieldTitle || block.fieldId} ${getString(block.tabId)?.tClean}`
            : getString(block.tabId)?.tClean

    // const values = [specifiedTitle, shortTitle, defaultTitle, tabTitle, fieldTitle, entityName, key]
    // console.table(values)

    if (specifiedTitle) {
        key = 'specified'
        label = specifiedTitle
    } else if (shortTitle) {
        key = defaultKey + '.short'
        label = shortTitle
    } else if (defaultTitle) {
        key = defaultKey
        label = defaultTitle
    } else if (tabTitle) {
        key = block.tabId
        label = tabTitle
    } else if (fieldTitle) {
        key = getBlockKey({
            block: { ...block, i18nNamespace: block.sectionId, id: block.fieldId }
        })
        label = fieldTitle
    } else if (entityName) {
        key = 'entity'
        label = entityName
    } else {
        label = key
    }
    return { key, label }
}

export const useBlockTitle = ({ block }: { block: BlockVariantDefinition }) => {
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
export const getBlockTakeaway = ({
    block,
    pageContext,
    getString,
    values,
    options
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    values?: any
    options?: {
        isHtml?: boolean
    }
}) => {
    const { getFallbacks } = useI18n()
    const takeawayKey = `${getBlockKey({ block })}.takeaway`
    const descriptionKey = getBlockDescriptionKey(block)
    const { currentEdition } = pageContext

    const keysList = [
        // edition-specific takeaway
        `${takeawayKey}.${currentEdition.id}`,
        // generic takeaway
        takeawayKey,
        // generic block description
        descriptionKey
    ]
    if (block.takeawayKey) {
        keysList.unshift(block.takeawayKey)
    }
    const tObject = getFallbacks(keysList, values)
    return tObject?.tHtml || tObject?.t
}

export const useBlockTakeaway = ({ block }: { block: BlockVariantDefinition }) => {
    const { getString } = useI18n()
    const entities = useEntities()
    const pageContext = usePageContext()
    return getBlockTakeaway({ block, pageContext, getString, entities })
}

/*

In order of priority, use:

1. an id explicitly defined as the block's definitionId
2. a description for the specific edition (e.g. user_info.age.description.js2022)
3. a generic description key (e.g. user_info.age.description.js2022)

*/
export const getBlockDescriptionKey = (block: BlockVariantDefinition) =>
    block.descriptionKey ?? `${getBlockKey({ block })}.description`
export const getBlockDescription = ({
    block,
    pageContext,
    getString,
    values,
    options
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    values?: any
    options?: {
        isHtml?: boolean
    }
}) => {
    const descriptionKey = getBlockDescriptionKey(block)
    const { currentEdition } = pageContext
    const blockDescription =
        (block.description && snarkdown(block.description)) ||
        (block.descriptionId && getString(block.descriptionId, { values })?.tHtml)
    const editionDescription = getString(`${descriptionKey}.${currentEdition.id}`, {
        values
    })?.tHtml
    const genericDescription = getString(descriptionKey, { values })?.tHtml
    return blockDescription || editionDescription || genericDescription
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
    const { getString } = useI18n()
    const pageContext = usePageContext()
    return getBlockDescription({ block, pageContext, getString, values, options })
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
    title: title_
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    getString: StringTranslator
    title?: string
}) => {
    const { id } = block
    const link = getBlockLink({ block, pageContext })
    const { currentEdition } = pageContext
    const { year, hashtag } = currentEdition
    const trackingId = `${pageContext.currentPath}${id}`.replace(/^\//, '')

    const { label: blockTitle } = getBlockTitle({ block, pageContext, getString })
    const title = title_ || blockTitle

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
