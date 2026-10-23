import { BucketUnits } from './data'
import { Entity } from './entities'
import { Filter, OperatorEnum, ResponsesParameters, ResultsSubFieldEnum } from './api'
import { CustomNormalizationDefinition } from './responses'
import { OrderOptions } from './outlines'

export interface SitemapSectionFields {
    id: string
    titleId: string
    descriptionId: string
    path: string
    blocks?: BlockDefinition[]
}

export interface SitemapSection extends SitemapSectionFields {
    children?: SitemapSectionFields[]
}

export type BlockMode = 'absolute' | 'relative'

export interface ChartOptions {
    limit?: number
    dataFilters?: string[]
    categories?: string[]
    defaultMarker?: 'average' | 'median'
    defaultView?: string
    // scatterplot: draw a least-squares regression line (with R²) through the points
    showTrendLine?: boolean
    // multi items chart: initial chart state
    grouping?: string
    sort?: string
    order?: `${OrderOptions}`
}

export interface BlockVariantDefinition {
    id: string
    bucketKeysName?: string
    fieldId?: string
    sectionId: string
    sectioni18nNamespace?: string
    template?: string
    blockType?: string
    tabId?: string
    titleKey?: string
    titleId?: string
    questionKey?: string
    description?: string
    descriptionKey?: string
    takeaway?: string
    takeawayKey?: string
    noteKey?: string

    defaultUnits?: BucketUnits
    availableUnits?: Array<BucketUnits>

    // defaultView?: Views

    // data
    query?: string
    variables?: any
    parameters?: ResponsesParameters
    filters?: BiquadFilterType[]
    queryOptions?: SitemapBlockQueryOptions
    hideCutoff?: number

    // predefined filters state
    filtersState?: CustomNormalizationDefinition

    // config
    mode?: BlockMode

    // will default to the id of the chart
    i18nNamespace?: string
    colorVariant?: string
    overrides?: object

    // booleans
    legendPosition?: 'bottom' | 'top'
    translateData?: boolean
    hasSponsor?: boolean
    hasComments?: boolean

    wrapBlock?: boolean
    showInNav?: boolean

    dataPath?: string
    isFreeform?: boolean

    // from BlockChart
    switcherPosition?: 'top' | 'bottom'
    showNote?: boolean
    customChart?: any

    customizationModes?: string[]

    // options that only affect how the chart is displayed, not the query or data
    chartOptions: ChartOptions
}

export interface BlockVariantComputed extends BlockVariantDefinition {
    path: string
}

export interface BlockDefinition {
    id: string
    variants: BlockVariantComputed[]
}

export interface SitemapBlockParameters {
    years?: number[]
    rankCutoff: number
    limit: number
    cutoff: number
    showNoAnswer: boolean
}

/**
 * Mirrors ProvidedQueryOptions in results/src/core/queries/types.ts,
 * plus the fields the sitemap uses to override the query's question/section
 */
export interface SitemapBlockQueryOptions {
    allEditions?: boolean
    editionsCount?: number
    addBucketsEntities?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    addRatios?: boolean
    addBuckets?: boolean
    addGroupedBuckets?: boolean
    addNestedBuckets?: boolean
    addCorrelations?: boolean
    addCardinalities?: boolean
    // makes the query append a "nesting" parameter (templates only)
    enableBucketNesting?: boolean
    sectionId?: string
    questionId?: string
    subField?: `${ResultsSubFieldEnum}`
}

/*

Raw sitemap (results/surveys/<editionId>/config/raw_sitemap.yml)

These types describe the YAML as written, before computeSitemap()
in results/node_src/sitemap.ts applies templates and adds computed fields.
Block templates (results/src/templates/*.yml) share the same shape.

*/

export interface ResultsSitemapPage {
    id: string
    path: string
    titleId?: string
    descriptionId?: string
    // override the id used to build "sections.<intlId>.*" i18n keys
    intlId?: string
    i18nNamespace?: string
    showTitle?: boolean
    is_hidden?: boolean
    // blockType used for blocks that don't specify one (inherited by children)
    defaultBlockType?: string
    blocks?: ResultsSitemapBlock[]
    children?: ResultsSitemapPage[]

    /** @deprecated css2020 only, not read anywhere */
    showSidebar?: boolean
    /** @deprecated devs2025 only, page variables injection is commented out in computeSitemap */
    variables?: Record<string, unknown>
}

export type ResultsSitemap = ResultsSitemapPage[]

export interface ResultsSitemapFacet {
    id: string
    sectionId: string
}

export interface ResultsSitemapFilterCondition {
    sectionId: string
    fieldId: string
    operator: `${OperatorEnum}`
    value: string | string[]
}

export interface ResultsSitemapFilterSeries {
    year?: number
    conditions: ResultsSitemapFilterCondition[]
}

/**
 * Raw-YAML counterpart of CustomizationDefinition in
 * results/src/core/filters/types.ts (all fields optional here)
 */
export interface ResultsSitemapFiltersState {
    options?: {
        mode?: 'grid' | 'combined' | 'facet' | 'default'
        supportedModes?: Array<'grid' | 'combined' | 'facet' | 'default'>
        showDefaultSeries?: boolean
        enableYearSelect?: boolean
        queryOnLoad?: boolean
        preventQuery?: boolean
        sort?: string
        order?: `${OrderOptions}`
    }
    filters?: ResultsSitemapFilterSeries[] | null
    axis1?: ResultsSitemapFacet
    axis2?: ResultsSitemapFacet
    /** @deprecated alias for axis2, still what every sitemap uses */
    facet?: ResultsSitemapFacet
    bucketsFilter?: Filter<string>
}

export interface ResultsSitemapSeries {
    id: string
    facet: ResultsSitemapFacet
}

export interface ResultsSitemapAward {
    id: string
    value?: string | number
    // newer format: a category containing its own awards
    template?: string
    awards?: Array<{ id: string; value: string | number }>
}

export interface ResultsSitemapBlock {
    // optional on blocks whose template provides it (e.g. page_introduction)
    id?: string
    template?: string
    blockType?: string
    // only on a page's top-level blocks
    variants?: ResultsSitemapBlock[]

    // question
    fieldId?: string
    // css2022 only: turns `id` into `<id>_by_<facet>`, see computeSitemap
    facet?: string

    // i18n
    i18nNamespace?: string
    titleId?: string
    titleKey?: string
    descriptionId?: string
    descriptionKey?: string
    questionKey?: string
    noteKey?: string
    tabId?: string
    takeaway?: string
    takeawayKey?: string
    translateData?: boolean

    // data
    query?: string
    dataPath?: string
    hasData?: boolean
    // injected into the template with lodash template syntax
    variables?: Record<string, unknown>
    parameters?: ResponsesParameters
    queryOptions?: SitemapBlockQueryOptions
    filtersState?: ResultsSitemapFiltersState
    series?: ResultsSitemapSeries[]

    // display
    chartOptions?: ChartOptions
    defaultUnits?: `${BucketUnits}`
    defaultView?: string
    customizationModes?: string[]
    hideOtherAnswersBucket?: boolean

    // layout
    wrapBlock?: boolean
    showInNav?: boolean
    showTitle?: boolean
    hidden?: boolean
    disableExport?: boolean
    hasSponsor?: boolean

    // block-specific content
    items?: string[]
    awards?: ResultsSitemapAward[]

    /** @deprecated 2021/2022 editions, not read anywhere (use i18nNamespace) */
    blockNamespace?: string
    /** @deprecated 2021/2022 editions, not read anywhere (use i18nNamespace) */
    chartNamespace?: string
    /** @deprecated comma-separated string, use i18nNamespace */
    i18nNamespaces?: string
    /** @deprecated css2022/graphql2022 only, use titleId */
    intlId?: string
    /** @deprecated css2020/js2020 only, export is on unless disableExport is set */
    enableExport?: boolean
    /** @deprecated css2020/js2020 only */
    showLegend?: boolean
    /** @deprecated css2020 only, not read anywhere */
    isReport?: boolean
    /** @deprecated css2020 only */
    pageId?: string
    /** @deprecated 2021/2022 editions, not read anywhere */
    year?: number
    /** @deprecated not read anywhere */
    chartOnly?: boolean
    /** @deprecated graphql2022/js2021 only, not read anywhere */
    dataFunction?: string
    /** @deprecated td2022 only, not read anywhere */
    hideCutoff?: number
    /** @deprecated use defaultUnits */
    units?: `${BucketUnits}`
    /** @deprecated devs2026 only, "doesn't work yet" */
    extends?: string
    /** @deprecated not read anywhere (noteKey is) */
    noteId?: string | null
    /** @deprecated templates only, not read anywhere */
    keysPath?: string
    /** @deprecated templates only, not read anywhere */
    bucketKeysName?: string
    /** @deprecated templates only, not read anywhere */
    availableUnits?: Array<`${BucketUnits}`>
    /** @deprecated templates only, only read in commented-out code */
    showDescription?: boolean
    /** @deprecated templates only, not read anywhere */
    hasComments?: boolean
    /** @deprecated not read anywhere */
    isFreeform?: boolean
    /** @deprecated ai2025/ai2026/css2026 only, not read anywhere */
    showAverage?: boolean
}
