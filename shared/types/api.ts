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
    PATTERNS = 'patterns',
    ERROR = 'error'
}

export type DbPathsStrings = {
    [key in Exclude<
        DbPathsEnum,
        DbPathsEnum.FOLLOWUP_PREDEFINED | DbPathsEnum.FOLLOWUP_FREEFORM
    >]?: string
}

export interface DbPaths extends DbPathsStrings {
    [DbPathsEnum.FOLLOWUP_PREDEFINED]: OptionsDbPaths
    [DbPathsEnum.FOLLOWUP_FREEFORM]: OptionsDbPaths
}

export type OptionsDbPaths = {
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
}

export interface SortSpecifier {
    order: 'asc' | 'desc'
    property: 'options' | 'count' | 'percent' | 'id' | 'mean' | 'average'
}
