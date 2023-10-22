import { QuestionApiObject } from './surveys'
import { Filters } from './filters'
import { Option, OptionId, ResponsesTypes, SortProperty } from '@devographics/types'

export interface GenericComputeArguments {
    responsesType?: ResponsesTypes
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
    showNoMatch?: boolean
    groupUnderCutoff?: boolean
    mergeOtherBuckets?: boolean
    enableBucketGroups?: boolean
    responsesType?: ResponsesTypes
}

export interface ComputeAxisParameters {
    question: QuestionApiObject
    sort: SortProperty
    order: SortOrderNumeric
    cutoff: number
    groupUnderCutoff?: boolean
    mergeOtherBuckets?: boolean
    enableBucketGroups?: boolean
    limit: number
    cutoffPercent?: number
    options?: Option[]
}

export interface SortSpecifier {
    property: SortProperty
    order: SortOrder
}

export type SortOrder = 'asc' | 'desc'
export type SortOrderNumeric = 1 | -1
