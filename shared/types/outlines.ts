import { DbPaths } from './api'

export interface SurveyConfig {
    /** state-of-js */
    id: string
    name: string
    domain: string
    hashtag: string

    dbCollectionName: string

    emailOctopus: EmailOctopusData

    partners: [SponsorItem]
}

export interface EmailOctopusData {
    listId: string
}

export interface SponsorItem {
    id: string
    name: string
    url: string
    imageUrl: string
}

export interface Survey extends SurveyConfig {
    editions: Edition[]
}

export type Edition = {
    id: string
    sections: Section[]
    apiSections: Section[]
    // TODO: maybe we should use a string here, so we can have "Summer 2023" instead of "2023"
    // it's never really used as a number in the code
    year: number
    credits: Credit[]
    resultsUrl: string
    questionsUrl: string
    imageUrl: string
    socialImageUrl: string
    faviconUrl: string
    status: SurveyStatus
    tshirt: Tshirt
    colors: Colors
}

/**
 * 1 preview
 * 2 open
 * 3 closed
 * 4 hidden
 */
export type SurveyStatus = 1 | 2 | 3 | 4
export type SurveyStatusLabel = 'preview' | 'open' | 'closed' | 'hidden'

export enum SurveyStatusEnum {
    PREVIEW = 1,
    OPEN = 2,
    CLOSED = 3,
    HIDDEN = 4
}

export type Colors = {
    primary: string
    secondary: string
    text: string
    background: string
    backgroundSecondary: string
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
    intlId?: string
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
    intlId?: string
    label?: string
    yearAdded?: number
    options?: Option[]
    // options/values for the question are numeric
    optionsAreNumeric?: boolean
    // options are ranges of numbers
    optionsAreRange?: boolean
    defaultSort?: string

    limit?: number

    i18nNamespace?: string

    // for slider questions
    from?: number
    to?: number

    allowMultiple?: boolean
    allowOther?: boolean
    allowPrenormalized?: boolean
    allowComment?: boolean

    matchTags?: string[]
}

export type Option = {
    id: OptionId
    editions?: string[]
    average?: number
    label?: string
}

export type OptionId = string | number

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

// once a question has gone through a template it should always have an id
// if we know an ID exists we can use this type to cast the object
export interface QuestionWithId extends Omit<Question, 'id'> {
    id: string
}

export interface QuestionTemplateOutput extends QuestionWithId {
    rawPaths?: DbPaths
    normPaths?: DbPaths
    options?: Option[]
    extends?: string
}

export type TemplateFunction = (arg0: TemplateArguments) => QuestionTemplateOutput
