export type CustomizationDefinition = {
    options: CustomizationOptions
    filters?: CustomizationFilters[]
    facet?: string
}

export type SupportedMode = 'grid' | 'combined' | 'facet' | 'default'

export type CustomizationOptions = {
    name?: string
    showDefaultSeries?: boolean
    enableYearSelect?: boolean
    mode?: SupportedMode
    supportedModes: SupportedMode[]
    queryOnLoad?: boolean
}

export type CustomizationFilters = {
    year: number
    conditions: CustomizationFiltersCondition[]
}

export type CustomizationFiltersCondition = {
    field: string
    operator: string
    value: string
}
