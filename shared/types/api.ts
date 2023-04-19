import { Survey, Edition, Section, Question } from './outlines'

export interface ParsedSurvey extends Omit<Survey, 'editions'> {
    editions: ParsedEdition[]
}

export interface ParsedEdition extends Omit<Edition, 'sections' | 'apiSections'> {
    sections: ParsedSection[]
    apiSections: ParsedSection[]
}

export interface ParsedSection extends Omit<Section, 'questions'> {
    questions: ParsedQuestion[]
}

export enum DbSuffixes {
    CHOICES = 'choices',
    EXPERIENCE = 'experience',
    OTHERS = 'others',
    NORMALIZED = 'normalized',
    PRENORMALIZED = 'prenormalized',
    COMMENT = 'comment'
}

export type DbPaths = {
    response: string
    other: string
    comment: string
}

export interface TemplateOutputQuestion extends Omit<Question, 'id'> {
    id: string

    // dbSuffix?: DbSuffixes
    // rawPath?: string
    // dbPath?: string
    // dbPathComments?: string
    includeInApi?: boolean
    // isNormalized?: boolean

    editions?: string[]

    typeDef?: string

    isGlobal?: boolean

    autogenerateOptionType?: boolean
    autogenerateEnumType?: boolean
    autogenerateFilterType?: boolean

    fieldTypeName?: string
    filterTypeName?: string
    optionTypeName?: string
    enumTypeName?: string
}

export interface ParsedQuestion extends Omit<TemplateOutputQuestion, 'fieldTypeName'> {
    sectionIds: string[]
    sectionIndex: number
    surveyId: string
    fieldTypeName: string
    contentType: 'string' | 'number'
}

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
