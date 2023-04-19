import { Survey, Edition, Section, Question } from './outlines'

// export interface QuestionParsed extends Omit<TemplateOutputQuestion, 'fieldTypeName'> {
//     sectionIds: string[]
//     sectionIndex: number
//     surveyId: string
//     fieldTypeName: string
//     contentType: 'string' | 'number'
// }

export type ResponseArguments = {
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
