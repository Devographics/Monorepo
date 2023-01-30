export type CustomizationDefinition = {
    options: CustomizationOptions
    filters?: CustomizationFilters[]
    facet?: string
}

export type CustomizationOptions = {
    name?: string
    showDefaultSeries?: boolean
    allowModeSwitch?: boolean
    enableYearSelect?: boolean
    behavior?: 'combined' | 'multiple'
    mode?: 'filters' | 'facet' | 'default'
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
