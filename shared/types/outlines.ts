import { DbPaths } from './api'
import { Entity } from './entities'

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
    // TODO: should these be strings or dates?
    startedAt: string
    endedAt: string
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
    enableReadingList: boolean
    /**
     * Where the user found out about the survey
     * Should be a valid multiselect option
     */
    sources?: Array<Option>
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
    role: string
    entity?: Entity
}

export type Section = {
    id: string
    messageId?: string
    intlId?: string
    slug: string // TODO: maybe get rid of this?
    questions: Question[]
    // define a default template for all questions in this section
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
    // override the template
    inputComponent?: string

    id?: string
    intlId?: string
    label?: string
    yearAdded?: number
    options?: Option[]
    // options/values for the question are numeric
    optionsAreNumeric?: boolean
    // options are ranges of numbers
    optionsAreRange?: boolean
    // options follow each other sequentially
    optionsAreSequential?: boolean
    defaultSort?: string

    // how many options can be selected
    limit?: number
    // how many options to show before "show more…" button (set to 99 to always show all)
    cutoff?: number

    // typically the question id is used as the question "namespace", this can override it
    i18nNamespace?: string

    // for slider questions
    from?: number
    to?: number

    allowMultiple?: boolean
    allowOther?: boolean
    allowPrenormalized?: boolean
    allowComment?: boolean
    showCommentInput?: boolean
    randomize?: boolean

    matchTags?: string[]

    // a question that's in the outline but not in the API
    hasApiEndpoint?: boolean
}

export type Option = {
    id: OptionId
    intlId?: string
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
