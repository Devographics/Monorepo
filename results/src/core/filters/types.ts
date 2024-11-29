import React from 'react'
import { QuestionMetadata } from '@devographics/types'
import { OrderOptions } from 'core/charts/common2/types'

export interface CustomizationDefinition {
    options: CustomizationOptions
    filters?: CustomizationFiltersSeries[]
    facet?: FacetItem
    bucketsFilter?: BucketsFilterDefinition
}

export interface BucketsFilterDefinition {
    eq?: string
    in?: string[]
    nin?: string[]
    hasTags?: string[]
}

export interface PresetDefinition extends CustomizationDefinition {
    name: string
}

export type SupportedMode = 'grid' | 'combined' | 'facet' | 'default'

export type CustomizationOptions = {
    name?: string
    showDefaultSeries?: boolean
    enableYearSelect?: boolean
    mergeOtherBuckets?: boolean
    mode?: SupportedMode
    supportedModes?: SupportedMode[]
    queryOnLoad?: boolean
    // if true these filters will not trigger a fetch() call
    preventQuery?: boolean
    cutoff?: number
    cutoffType?: 'count' | 'percent'
    limit?: number
    sort?: string
    order?: OrderOptions
}

export type CustomizationFiltersSeries = {
    year?: number
    conditions: CustomizationFiltersCondition[]
    isDefault?: boolean
}

export type CustomizationFiltersCondition = {
    sectionId: string
    fieldId: string
    operator: OptionsOperatorEnum | NumericOperatorEnum
    value: FilterValue
}

export type Operator = 'eq' | 'in' | 'nin'

export enum OptionsOperatorEnum {
    EQ = 'eq',
    IN = 'in',
    NIN = 'nin'
}

export enum NumericOperatorEnum {
    EQ = 'eq',
    LT = 'lt',
    GT = 'gt'
}

export type FilterItem = QuestionMetadata

export type FacetItem = Pick<QuestionMetadata, 'id' | 'sectionId' | 'optionsAreSequential'>

export type FilterValue = FilterValueString | FilterValueArray

export type FilterValueString = string
export type FilterValueArray = string[]

export type PanelState = {
    filtersState: CustomizationDefinition
    setFiltersState: React.Dispatch<React.SetStateAction<CustomizationDefinition>>
    customPresets: PresetDefinition[]
    setCustomPresets: React.Dispatch<React.SetStateAction<PresetDefinition[]>>
}

export type DataSeries<QuestionDataType> = {
    name: string
    // for series obtained at build time through API, path to locate data in page context
    dataPath?: string
    data: QuestionDataType
    filters?: CustomizationFiltersSeries
    facet?: FacetItem
}

export enum ChartModes {
    CHART_MODE_GRID = 'grid',
    CHART_MODE_STACKED = 'stacked',
    CHART_MODE_GROUPED = 'grouped',
    CHART_MODE_DEFAULT = 'default'
}
