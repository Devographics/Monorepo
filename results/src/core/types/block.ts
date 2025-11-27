import React from 'react'
import {
    BucketUnits,
    QuestionMetadata,
    ResponsesParameters,
    ResultsSubFieldEnum
} from '@devographics/types'
import { CustomizationDefinition } from 'core/filters/types'
import { PageContextValue } from './context'
import { CustomVariant } from 'core/filters/helpers'
import { Views } from 'core/charts/horizontalBar2/types'

export type BlockUnits =
    | 'count'
    | 'percentageSurvey'
    | 'percentageQuestion'
    | 'percentageFacet'
    | 'percentageBucket'
    | 'average'
export type BlockRatioUnits =
    | 'satisfaction_percentage'
    | 'interest_percentage'
    | 'awareness_percentage'
    | 'usage_percentage'
export type BlockSetUnits = React.Dispatch<React.SetStateAction<string>>
export type BlockMode = 'absolute' | 'relative'

export interface BlockComponentProps {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    question: QuestionMetadata
    variant?: CustomVariant
}

export interface BlockQueryOptions {
    addBucketsEntities?: boolean
    addQuestionEntity?: boolean
    addQuestionComments?: boolean
    addNestedBuckets?: boolean
    subField?: ResultsSubFieldEnum
    sectionId?: string
}

export interface BlockDefinition {
    id: string
    variants: Array<BlockVariantDefinition>
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
    titleId?: string
    questionKey?: string
    description?: string
    descriptionId?: string
    takeaway?: string
    takeawayKey?: string
    noteId?: string

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

export interface ChartOptions {
    limit?: number
    dataFilters?: string[]
    categories?: string[]
    defaultMarker?: 'average' | 'median'
    defaultView?: string
}

export interface BlockWithAwards {
    /**
     * Award categories
     * (usually we have 4 of them)
     */
    awards: Array<{
        id: string
        /**
         * Awards for this category
         */
        awards: Array<Award>
    }>
}

export interface Award {
    id: string
    name: string
    value: string | number
}

type FilterType = 'filters' | 'facets'

export interface BlockLegend {
    id: string
    label: string
    shortLabel?: string
    color?: string
    gradientColors?: string[]
}

export interface BlockDataType {
    units: 'percentage' | string
    data: { [units: string]: any }
}
