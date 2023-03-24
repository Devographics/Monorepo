import { ParsedQuestionExt } from './surveys'
import { Filters } from './filters'

export interface GenericComputeArguments {
    filters?: Filters
    parameters?: GenericComputeParameters
    facet?: string
    selectedEditionId?: string
}

export interface GenericComputeParameters {
    // bucket
    sort?: SortSpecifier
    limit?: number
    cutoff?: number
    cutoffPercent?: number
    // facet
    facetSort?: SortSpecifier
    facetLimit?: number
    facetCutoff?: number
    facetCutoffPercent?: number
    enableCache?: boolean
    showNoAnswer?: boolean
}

export interface ComputeAxisParameters {
    question: ParsedQuestionExt
    sort: SortProperty
    order: SortOrderNumeric
    cutoff: number
    limit: number
    cutoffPercent?: number
    options?: string[]
}

export interface SortSpecifier {
    property: SortProperty
    order: SortOrder
}

export type SortProperty = 'options' | 'count' | 'percent' | 'id'

export type SortOrder = 'asc' | 'desc'
export type SortOrderNumeric = 1 | -1
