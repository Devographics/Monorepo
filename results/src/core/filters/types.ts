import React from 'react'
import { OptionMetadata, AllQuestionData, QuestionMetadata } from '@devographics/types'

export interface CustomizationDefinition {
    options: CustomizationOptions
    filters: CustomizationFiltersSeries[]
    facet?: FacetItem
}

export interface PresetDefinition extends CustomizationDefinition {
    name: string
}

export type SupportedMode = 'grid' | 'combined' | 'facet' | 'default'

export type CustomizationOptions = {
    name?: string
    showDefaultSeries?: boolean
    enableYearSelect?: boolean
    mode?: SupportedMode
    supportedModes?: SupportedMode[]
    queryOnLoad?: boolean
}

export type CustomizationFiltersSeries = {
    year?: number
    conditions: CustomizationFiltersCondition[]
}

export type CustomizationFiltersCondition = {
    sectionId: string
    fieldId: string
    operator: OperatorEnum
    value: FilterValue
}

export type Operator = 'eq' | 'in' | 'nin'

export enum OperatorEnum {
    EQ = 'eq',
    IN = 'in',
    NIN = 'nin'
}

export type FilterItem = QuestionMetadata

export type FacetItem = Pick<QuestionMetadata, 'id' | 'sectionId'>

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
