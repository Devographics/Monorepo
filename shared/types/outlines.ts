import { TemplateOutputQuestion } from './api'

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

export interface QuestionTemplateOutput extends Omit<TemplateOutputQuestion, 'id'> {
    id: string
}

export type TemplateFunction = (arg0: TemplateArguments) => QuestionTemplateOutput
