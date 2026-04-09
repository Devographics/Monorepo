import type { SitemapBlock } from '../load-sitemap'
import getBlockDataDocument from '../graphql/get-block-data.graphql'
import getSectionItemsDocument from '../graphql/get-section-items.graphql'
import { graphqlLiteral, interpolateGraphqlDocument, requestGraphql } from './graphql/client'
import type {
    BlockVariantDefinition,
    Bucket,
    EditionMetadata,
    ResponseEditionData,
    SurveyMetadata
} from '@devographics/types'
import { getDataLocations, getFileAsJSON, getFileAsString, getLoadMethod } from './load'
import path from 'path'
import { parse } from 'graphql'
import { print } from 'graphql-print'
import { getBlockQuery } from './queries'

const DATA_TEMPLATES: Record<string, string> = {
    multiple_options2: 'combined',
    multiple_options2_freeform: 'freeform',
    multiple_options2_combined: 'combined'
}

const ITEMS_TEMPLATES = new Set([
    'multi_items_experience',
    'multi_items_ratios',
    'tools_arrows',
    'tier_list',
    'scatterplot_overview'
])

type QuestionSpec = {
    kind: 'question'
    blockId: string
    sectionId: string
    subField: string
}

type ItemsSpec = {
    kind: 'items'
    blockId: string
    sectionId: string
}

export type BlockQuerySpec = QuestionSpec | ItemsSpec

export type BlockResult = {
    blockId: string
    edition: ResponseEditionData
}

export type SectionItemResult = {
    sectionId: string
    items: Array<{ id: string; edition: ResponseEditionData }>
}

const isObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v)

const isBucket = (v: unknown): v is Bucket =>
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.count === 'number' &&
    typeof v.percentageQuestion === 'number' &&
    typeof v.percentageSurvey === 'number'

const isCompletion = (v: unknown): v is { count: number; total: number } =>
    isObject(v) && typeof v.count === 'number' && typeof v.total === 'number'

const isResponseEditionData = (v: unknown): v is ResponseEditionData =>
    isObject(v) &&
    typeof v.editionId === 'string' &&
    typeof v.year === 'number' &&
    isCompletion(v.completion) &&
    Array.isArray(v.buckets) &&
    v.buckets.every(isBucket)

const getResponseDataRoot = (data: Record<string, unknown>) => {
    if (isObject(data.dataAPI)) return data.dataAPI
    if (isObject(data.data)) return data.data
    return data
}

const getCurrentEditionData = (allEditions: unknown[], editionId: string) => {
    const edition = allEditions.find(
        edition => isObject(edition) && edition.editionId === editionId
    )
    return isResponseEditionData(edition) ? edition : undefined
}

const getBlockData = (
    data: Record<string, unknown>,
    surveyId: string,
    editionId: string,
    sectionId: string,
    questionId: string,
    subField: string
): ResponseEditionData | undefined => {
    const surveys = getResponseDataRoot(data).surveys
    if (!isObject(surveys)) return undefined
    const survey = surveys[surveyId]
    if (!isObject(survey)) return undefined
    const edition = survey[editionId]
    if (!isObject(edition)) return undefined
    const section = edition[sectionId]
    if (!isObject(section)) return undefined
    const question = section[questionId]
    if (!isObject(question)) return undefined
    const subFieldData = question[subField]
    if (!isObject(subFieldData)) return undefined
    const allEditions = subFieldData.allEditions
    if (!Array.isArray(allEditions)) return undefined
    return getCurrentEditionData(allEditions, editionId)
}

type RawSectionItem = { id: string; responses: { allEditions: unknown[] } }

const isRawSectionItem = (v: unknown): v is RawSectionItem =>
    isObject(v) &&
    typeof v.id === 'string' &&
    isObject(v.responses) &&
    Array.isArray(v.responses.allEditions)

const getSectionRawItems = (
    data: Record<string, unknown>,
    surveyId: string,
    editionId: string,
    sectionId: string
): RawSectionItem[] | undefined => {
    const surveys = getResponseDataRoot(data).surveys
    if (!isObject(surveys)) return undefined
    const survey = surveys[surveyId]
    if (!isObject(survey)) return undefined
    const edition = survey[editionId]
    if (!isObject(edition)) return undefined
    const section = edition[sectionId]
    if (!isObject(section)) return undefined
    const items = section._items
    if (!Array.isArray(items)) return undefined
    return items.filter(isRawSectionItem)
}

export const getBlockQuerySpec = (block: SitemapBlock, pageId: string): BlockQuerySpec | null => {
    // block.template and block.id are explicitly typed as string | undefined in SitemapBlock
    if (!block.id || !block.template) return null

    const queryOptions = block.queryOptions
    const sectionId =
        isObject(queryOptions) && typeof queryOptions.sectionId === 'string'
            ? queryOptions.sectionId
            : pageId

    if (block.template in DATA_TEMPLATES) {
        const fieldId = block.fieldId
        const questionId = typeof fieldId === 'string' ? fieldId : block.id
        return {
            kind: 'question',
            blockId: questionId,
            sectionId,
            subField: DATA_TEMPLATES[block.template]
        }
    }

    if (ITEMS_TEMPLATES.has(block.template) && sectionId.startsWith('_')) {
        return {
            kind: 'items',
            blockId: block.id,
            sectionId
        }
    }

    return null
}

export const fetchBlockData = async (
    surveyId: string,
    editionId: string,
    spec: QuestionSpec
): Promise<BlockResult | null> => {
    // main block variables
    const { sectionId, blockId, subField } = spec

    // paths
    const paths = getDataLocations(surveyId, editionId)
    const basePath = paths.localPath + '/results'
    const baseUrl = paths.url + '/results'

    const dataDirPath = path.resolve(`${basePath}/data/${sectionId}`)
    const dataFileName = `${blockId}.json`
    const dataFilePath = `${dataDirPath}/${dataFileName}`
    const queryDirPath = path.resolve(`${basePath}/queries/${sectionId}`)
    const queryFileName = `${blockId}.graphql`
    const queryFilePath = `${queryDirPath}/${queryFileName}`

    // check for existing data, either locally or remotely
    const existingData = await getFileAsJSON({
        localPath: dataFilePath,
        remoteUrl: `${baseUrl}/data/${sectionId}/${dataFileName}`
    })

    // check for existing query .graphql document
    const existingQueryFormatted = await getFileAsString({
        localPath: queryFilePath,
        remoteUrl: `${baseUrl}/queries/${sectionId}/${queryFileName}`
    })

    // TODO: pass block to fetchBlockData()
    const block = { id: blockId } as BlockVariantDefinition

    const { query } = await getBlockQuery({
        block,
        survey: { id: surveyId } as SurveyMetadata,
        edition: { id: editionId } as EditionMetadata,
        section: { id: sectionId },
        chartFilters: block.filtersState
    })

    // check if query has changed compared to existing query document
    let queryFormatted
    try {
        const ast = parse(query)
        queryFormatted = print(ast, { preserveComments: true })
    } catch (error) {
        console.warn(error)
        console.log('⚠️ Detected issue in follwing query: ')
        console.log(query)
    }
    // check if query has changed
    const queryHasChanged = queryFormatted !== existingQueryFormatted

    // figure out if new data should be fetched
    let shouldFetchData
    let reason
    if (process.env.DISABLE_CACHE === 'true') {
        shouldFetchData = true
        reason = '[cache disabled]'
    } else {
        if (existingData) {
            if (queryHasChanged) {
                if (process.env.FROZEN === 'true' || getLoadMethod() === 'remote') {
                    shouldFetchData = false
                    reason =
                        getLoadMethod() === 'remote'
                            ? '[query changed but remote cached data exists]'
                            : '[query changed but data is frozen]'
                } else {
                    shouldFetchData = true
                    reason = '[query change detected]'
                }
            } else {
                shouldFetchData = false
                reason = '[no query change detected]'
            }
        } else {
            shouldFetchData = true
            reason = '[no existing data found]'
        }
    }

    try {
        let data
        if (shouldFetchData) {
            console.log(`// 🔍 ${reason} Running uncached query for file ${dataFileName}…`)
            data = await requestGraphql<Record<string, unknown>>(query)
        } else {
            console.log(
                `// 🎯 ${reason} File ${dataFileName} found on ${getLoadMethod()}, loading its contents…`
            )
            data = existingData
        }

        const edition = getBlockData(data, surveyId, editionId, sectionId, blockId, subField)
        return edition ? { blockId, edition } : null
    } catch (error) {
        console.error(`Failed to get data for block ${blockId}:`, error)
        return null
    }
}

export const fetchSectionItems = async (
    surveyId: string,
    editionId: string,
    sectionId: string
): Promise<SectionItemResult | null> => {
    const query = interpolateGraphqlDocument(getSectionItemsDocument, {
        SURVEY_ID: graphqlLiteral(surveyId),
        EDITION_ID: graphqlLiteral(editionId),
        SECTION_ID: graphqlLiteral(sectionId)
    })
    try {
        const data = await requestGraphql<Record<string, unknown>>(query)
        const rawItems = getSectionRawItems(data, surveyId, editionId, sectionId)
        if (!rawItems) return null
        const items = rawItems
            .map(item => ({
                id: item.id,
                edition: getCurrentEditionData(item.responses.allEditions, editionId)
            }))
            .filter((item): item is { id: string; edition: ResponseEditionData } =>
                isResponseEditionData(item.edition)
            )
        return { sectionId, items }
    } catch (error) {
        console.error(`Failed to fetch items for section ${sectionId}:`, error)
        return null
    }
}
