import { Entity } from './entities'

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

    defaultView?: Views

    // data
    query?: string
    variables?: any
    parameters?: ResponsesParameters
    filters?: FilterType[]
    queryOptions?: BlockQueryOptions
    hideCutoff?: number

    // predefined filters state
    filtersState?: CustomizationDefinition

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

export interface SitemapBlockQueryOptions {
    addBucketsEntities: boolean
}
