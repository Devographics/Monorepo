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
    // facet
    facetSort?: SortSpecifier
    facetLimit?: number
    facetCutoff?: number
    enableCache?: boolean
    showNoAnswer?: boolean
    showNoMatch?: boolean
    groupUnderCutoff?: boolean
    mergeOtherBuckets?: boolean
    enableBucketGroups?: boolean
    enableAddOverallBucket?: boolean
    enableAddMissingBuckets?: boolean
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
    enableAddMissingBuckets?: boolean
    limit: number
    options?: Option[]
}

export interface SortSpecifier {
    property: SortProperty
    order: SortOrder
}

export type SortOrder = 'asc' | 'desc'
export type SortOrderNumeric = 1 | -1
