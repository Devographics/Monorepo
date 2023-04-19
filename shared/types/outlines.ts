import { DbPaths, TemplateOutputQuestion } from './api'

export interface SurveyConfig {
    id: string
    name: string
    domain: string
}

export interface Survey extends SurveyConfig {
    editions: Edition[]
}

export type Edition = {
    id: string
    sections: Section[]
    apiSections: Section[]
    year: number
    credits: Credit[]
    resultsUrl: string
    questionsUrl: string
    status: number
    tshirt: Tshirt
}

export type Tshirt = {
    images: string[]
    url: string
    price: number
    designerUrl: string
}

export type Credit = {
    id: string
}

export type Section = {
    id: string
    slug: string // TODO: maybe get rid of this?
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
    template: string

    id?: string
    label?: string
    options?: Option[]
    optionsAreNumeric?: boolean
    defaultSort?: string

    // for slider questions
    from?: number
    to?: number

    allowOther?: boolean
    allowPrenormalized?: boolean
    allowComment?: boolean

    matchTags?: string[]
}

export type Option = {
    id: string
    editions?: string[]
    average?: number
    label?: string
}

export interface Country {
    name: string
    'alpha-3': string
    'country-code': string
}

export type TemplateArguments = {
    survey: Survey
    edition: Edition
    section: Section
    question: Question
}

export enum DbSuffixes {
    CHOICES = 'choices',
    EXPERIENCE = 'experience',
    OTHERS = 'others',
    NORMALIZED = 'normalized',
    PRENORMALIZED = 'prenormalized',
    COMMENT = 'comment',
    ERROR = 'error',
    PATTERNS = 'patterns',
    RAW = 'raw'
}

export type DbPaths = {
    response?: string
    other?: string
    comment?: string
    raw?: string
    patterns?: string
    error?: string
}

// once a question has gone through a template it should always have an id
// if we know an ID exists we can use this type to cast the object
export interface QuestionWithId extends Omit<Question, 'id'> {
    id: string
}

export interface QuestionTemplateOutput extends QuestionWithId {
    rawPaths?: DbPaths
    normPaths?: DbPaths
}

export type TemplateFunction = (arg0: TemplateArguments) => QuestionTemplateOutput
