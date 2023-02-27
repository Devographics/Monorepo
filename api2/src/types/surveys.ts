import { Entity } from '@devographics/core-models'
import { RequestContext } from '.'

export type TypeObject = {
    typeName: string
    typeDef: string
    typeType?: string
    path?: string
    // surveyId?: string
    // questionId?: string
}

export type TemplateArguments = {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}

export type TemplateFunction = (arg0: TemplateArguments) => QuestionTemplateOutput
export type NullTemplate = (arg0: TemplateArguments) => { includeInApi: boolean }

export interface TemplatesDictionnary {
    [index: string]: TemplateFunction | NullTemplate
}

export interface SurveyConfig {
    id: string
}

export interface Survey extends SurveyConfig {
    editions: Edition[]
}
export interface ParsedSurvey extends Omit<Survey, 'editions'> {
    editions: ParsedEdition[]
}

export type Edition = {
    id: string
    sections: Section[]
    apiSections: Section[]
    year: number
    credits: Credit[]
}

export type Credit = {
    id: string
}

export interface ParsedEdition extends Omit<Edition, 'sections' | 'apiSections'> {
    sections: ParsedSection[]
    apiSections: ParsedSection[]
}

export type Section = {
    id: string
    questions: Question[]
    template?: string
}
export interface ParsedSection extends Omit<Section, 'questions'> {
    questions: ParsedQuestion[]
}

export type ApiSection = {
    id: string
    questions: ApiQuestion[]
}

export type ApiQuestion = {
    id: string
    template?: string
}

export type Question = {
    template: string

    id?: string
    options?: Option[]
    optionsAreNumeric?: boolean
    defaultSort?: string

    autogenerateOptionType?: boolean
    autogenerateEnumType?: boolean
    autogenerateFilterType?: boolean
}

export interface QuestionTemplateOutput extends Omit<Question, 'id'> {
    id: string
}

export interface ParsedQuestion extends Omit<Question, 'id'> {
    id: string

    sectionIds: string[]
    dbPath?: string
    dbPathComments?: string
    includeInApi?: boolean

    editions?: string[]

    surveyId: string

    typeDef?: string

    resolverMap?: ResolverMap

    isGlobal?: boolean

    fieldTypeName: string
    filterTypeName?: string
    optionTypeName?: string
    enumTypeName?: string

    transformFunction?: TransformFunction
}

export type Option = {
    id: string
    editions?: string[]
    average?: number
}

export interface ResolverMap {
    [key: string]: ResolverType | ResolverMap
}

export interface ResolverParent {
    survey: ParsedSurvey
    edition: ParsedEdition
    section: ParsedSection
    question: ParsedQuestion
    questionObjects: ParsedQuestion[]
    responseArguments?: ResponseArguments
}

export interface QuestionResolverParent extends ResolverParent {
    options?: Option[]
}

export type ResponseArguments = {
    filters: any
    facet: string
    parameters: any
}

export type ResolverType = (
    parent: ResolverParent,
    args: any,
    context: RequestContext,
    info: any
) => any

export interface EditionData  {
    id: string
    year: number
    completion: YearCompletion
    buckets: Bucket[]
}

export interface EditionDataLegacy extends EditionData {
    facets?: any
}

export interface YearCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number
    // percentage of respondents compared to the total number of participants
    percentage_survey: number
}

// export interface Facet {
//     id: string | number
//     mean: number
//     type: string
//     completion: FacetCompletion
//     buckets: Bucket[]
//     entity: Entity
// }

export interface FacetCompletion extends YearCompletion {
    // percentage of respondents compared to the total number of participants
    percentage_question: number
}

export interface Bucket {
    count: number
    id: string
    count_all_facets?: number
    percentage_all_facets?: number
    percentage_facet?: number
    percentage_question: number
    percentage_survey: number
    completion?: BucketCompletion
    entity?: Entity
    facets: BucketFacet[]
}

type BucketFacet {
    facetId: String
    facetValue: String
    buckets: Bucket[]
}

export interface BucketCompletion extends FacetCompletion {}

export type TransformFunction = (
    parent: ResolverParent,
    data: EditionData[],
    context: RequestContext
) => any
