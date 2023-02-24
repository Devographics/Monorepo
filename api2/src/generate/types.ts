import { Entity } from '@devographics/core-models'
import { RequestContext } from '../types'

export type TypeObject = {
    typeName: string
    typeDef: string
    typeType: string
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

export type Survey = {
    id: string
    editions: Edition[]
}

export type Edition = {
    id: string
    sections: Section[]
    apiSections: ApiSection[]
    year: number
}

export type Section = {
    id: string
    questions: Question[]
    template?: string
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
    id: string
    options?: Option[]
    optionsAreNumeric?: boolean
    template?: string
}

export interface QuestionTemplateOutput {
    id?: string
    options?: Option[]
    optionsAreNumeric?: boolean
    template?: string

    sectionIds?: string[]
    dbPath?: string
    dbPathComments?: string
    includeInApi?: boolean

    editions?: string[]

    surveyId?: string
    typeDef?: string

    resolverMap?: ResolverMap

    isGlobal?: boolean
    fieldTypeName?: string
    filterTypeName?: string
    optionTypeName?: string
    enumTypeName?: string
}

export interface QuestionObject extends Question {
    sectionIds: string[]
    dbPath: string
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

export type ResolverParent = {
    survey: Survey
    edition: Edition
    section: Section
    question: QuestionObject
    computeOptions: ComputeOptions
}

export type ComputeOptions = {
    filters: any
    cutoff: number
    limit: number
    year: number
    facet: string
    facetLimit: number
    facetMinPercent: number
    facetMinCount: number
}

export type ResolverType = (
    parent: ResolverParent,
    args: any,
    context: RequestContext,
    info: any
) => any

export type YearData = {
    year: number
    completion: YearCompletion
    facets: Facet[]
}

export interface YearCompletion {
    count: number
    percentage_survey: number
    total: number
}

export interface Facet {
    id: string | number
    mean: number
    type: string
    completion: FacetCompletion
    buckets: Bucket[]
    entity: Entity
}

export interface FacetCompletion extends YearCompletion {
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
}

export interface BucketCompletion extends FacetCompletion {}

export type TransformFunction = (
    parent: ResolverParent,
    data: YearData[],
    context: RequestContext
) => any
