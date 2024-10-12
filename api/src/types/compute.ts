import { QuestionApiObject } from './surveys'
import { Filters } from './filters'
import {
    Option,
    OptionId,
    ResponsesTypes,
    SortOrderNumeric,
    SortProperty
} from '@devographics/types'

export enum ExecutionContext {
    // regular execution of the generic function
    REGULAR = 'regular',
    // secondary execution triggered to get overall results
    OVERALL = 'overall',
    // secondary execution triggered to get freeform combined results
    COMBINED = 'combined'
}

export interface GenericComputeArguments {
    responsesType?: ResponsesTypes
    filters?: Filters
    parameters?: GenericComputeParameters
    facet?: string
    selectedEditionId?: string
    // indicate if this was a second execution of the generic function
    // triggered to fetch freeform data for the combined subfield
    executionContext: ExecutionContext
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
    groupOverLimit?: boolean
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
    cutoffPercent?: number
    groupUnderCutoff?: boolean
    groupOverLimit?: boolean
    mergeOtherBuckets?: boolean
    enableBucketGroups?: boolean
    enableAddMissingBuckets?: boolean
    limit: number
    options?: Option[]
}
