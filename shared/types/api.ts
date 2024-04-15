import { ResponsesTypes } from './metadata'

// export interface QuestionParsed extends Omit<TemplateOutputQuestion, 'fieldTypeName'> {
//     sectionIds: string[]
//     sectionIndex: number
//     surveyId: string
//     fieldTypeName: string
//     contentType: 'string' | 'number'
// }

export enum ResultsSubFieldEnum {
    RESPONSES = 'responses',
    COMMENTS = 'comments',
    FOLLOWUPS = 'followups',
    FREEFORM = 'freeform',
    COMBINED = 'combined',
    PRENORMALIZED = 'prenormalized',
    MEDIANS = 'medians',
    OPTIONS = 'options',
    ENTITY = 'entity',
    ID = 'id',
    METADATA = '_metadata'
}

export enum DbPathsEnum {
    BASE = 'base',
    RESPONSE = 'response',
    OTHER = 'other',
    PRENORMALIZED = 'prenormalized',
    COMMENT = 'comment',
    FOLLOWUP_PREDEFINED = 'followup_predefined',
    FOLLOWUP_FREEFORM = 'followup_freeform',
    RAW = 'raw',
    // PATTERNS = 'patterns',
    METADATA = 'metadata',
    ERROR = 'error',
    SUBPATHS = 'subPaths',
    SKIP = 'skip',
    SENTIMENT = 'sentiment',
    EXPERIENCE = 'experience'
}

type DbPathsFirstLevel = Exclude<
    DbPathsEnum,
    // followup questions nest another question within the current one
    DbPathsEnum.FOLLOWUP_PREDEFINED | DbPathsEnum.FOLLOWUP_FREEFORM | DbPathsEnum.SUBPATHS
>

/**
 * Standardized fields that will directly contain a string
 * @example
 * ```
 * {
 *      response: "foobar",
 *      comment: "I am a comment"
 * }
 * ```
 */
export type DbPathsStrings = {
    [key in DbPathsFirstLevel]?: string
}

/**
 * Standardized field path for responses,
 * including first level paths
 * and nesting for followup
 */
export interface DbPaths extends DbPathsStrings {
    [DbPathsEnum.FOLLOWUP_PREDEFINED]?: DbSubPaths
    [DbPathsEnum.FOLLOWUP_FREEFORM]?: DbSubPaths
    [DbPathsEnum.SUBPATHS]?: DbSubPaths
}

export type DbSubPaths = {
    [key in string]: string
}

export type ResponseArguments = {
    responsesType: ResponsesTypes
    filters: Filters
    facet: string
    parameters: ResponsesParameters
}

export interface Filters {
    [key: string]: Filter<string>
}

export enum OperatorEnum {
    // must equal value
    EQ = 'eq',
    // must be one of given values
    IN = 'in',
    // must not be one of given values
    NIN = 'nin'
}

export interface Filter<T> {
    eq?: T
    in?: T[]
    nin?: T[]
}

export interface ResponsesParameters {
    cutoff?: number
    cutoffPercent?: number
    limit?: number
    sort?: SortSpecifier

    facetCutoff?: number
    facetCutoffPercent?: number
    facetLimit?: number
    facetSort?: SortSpecifier

    enableCache?: boolean
    showNoAnswer?: boolean
    mergeOtherBuckets?: boolean
}

export interface SortSpecifier {
    order: 'asc' | 'desc'
    property: 'options' | 'count' | 'percent' | 'id' | 'mean' | 'average'
}
