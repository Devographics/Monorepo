import React from 'react'
import { Option, OptionMetadata } from '@devographics/types'

export interface CustomizationDefinition {
    options: CustomizationOptions
    filters: CustomizationFiltersSeries[]
    facet?: string
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

export type FilterItem = {
    id: string
    sectionId: string
    options: OptionMetadata[]
    template: string
}

export type FilterValue = FilterValueString | FilterValueArray

export type FilterValueString = string
export type FilterValueArray = string[]

export type PanelState = {
    filtersState: CustomizationDefinition
    setFiltersState: React.Dispatch<React.SetStateAction<CustomizationDefinition>>
    customPresets: PresetDefinition[]
    setCustomPresets: React.Dispatch<React.SetStateAction<PresetDefinition[]>>
}
