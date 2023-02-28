import { ParsedQuestion } from './surveys'
import { Filters } from './filters'

export interface GenericComputeParameters {
    // filter aggregations
    filters?: Filters
    sort?: SortSpecifier
    facetSort?: SortSpecifier
    selectedEditionId?: string
    facet?: string
    // bucket
    limit?: number
    cutoff?: number
    cutoffPercent?: number
    // facet
    facetLimit?: number
    facetCutoff?: number
    facetCutoffPercent?: number
}

export interface ComputeAxisParameters {
    question: ParsedQuestion
    sort: string
    order: number
    cutoff?: number
    limit?: number
    cutoffPercent?: number
    options?: string[]
}

export interface SortSpecifier {
    property: string
    order: 'asc' | 'desc'
}
