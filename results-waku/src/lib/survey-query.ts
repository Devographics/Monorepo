import type { SitemapBlock } from '../load-sitemap'
import getBlockDataDocument from '../graphql/get-block-data.graphql'
import getSectionItemsDocument from '../graphql/get-section-items.graphql'
import { graphqlLiteral, interpolateGraphqlDocument, requestGraphql } from './graphql/client'

const DATA_TEMPLATES: Record<string, string> = {
    multiple_options2: 'responses',
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

export type Bucket = {
    id: string
    count: number
    percentageQuestion: number
    percentageSurvey: number
}

export type BlockEditionData = {
    editionId: string
    year: number
    completion: { count: number; total: number }
    buckets: Bucket[]
}

export type BlockResult = {
    blockId: string
    edition: BlockEditionData
}

export type SectionItemResult = {
    sectionId: string
    items: Array<{ id: string; edition: BlockEditionData }>
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

const isBlockEditionData = (v: unknown): v is BlockEditionData =>
    isObject(v) &&
    typeof v.editionId === 'string' &&
    typeof v.year === 'number' &&
    isCompletion(v.completion) &&
    Array.isArray(v.buckets) &&
    v.buckets.every(isBucket)

const getBlockEdition = (
    data: Record<string, unknown>,
    surveyId: string,
    editionId: string,
    sectionId: string,
    questionId: string,
    subField: string
): BlockEditionData | undefined => {
    const surveys = data.surveys
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
    const first = allEditions[0]
    return isBlockEditionData(first) ? first : undefined
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
    const surveys = data.surveys
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
    const query = interpolateGraphqlDocument(getBlockDataDocument, {
        SURVEY_ID: graphqlLiteral(surveyId),
        EDITION_ID: graphqlLiteral(editionId),
        SECTION_ID: graphqlLiteral(spec.sectionId),
        QUESTION_ID: graphqlLiteral(spec.blockId),
        SUB_FIELD: graphqlLiteral(spec.subField)
    })
    try {
        const data = await requestGraphql<Record<string, unknown>>(query)
        const edition = getBlockEdition(
            data,
            surveyId,
            editionId,
            spec.sectionId,
            spec.blockId,
            spec.subField
        )
        return edition ? { blockId: spec.blockId, edition } : null
    } catch (error) {
        console.error(`Failed to fetch ${spec.blockId}:`, error)
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
            .map(item => ({ id: item.id, edition: item.responses.allEditions[0] }))
            .filter((item): item is { id: string; edition: BlockEditionData } =>
                isBlockEditionData(item.edition)
            )
        return { sectionId, items }
    } catch (error) {
        console.error(`Failed to fetch items for section ${sectionId}:`, error)
        return null
    }
}
