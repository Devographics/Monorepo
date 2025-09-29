import { DbPaths } from './api'
import { Entity } from './entities'
import { SectionMetadata } from './metadata'

export interface SurveyConfig {
    /** state-of-js */
    id: string
    name: string
    domain: string
    hashtag: string

    homepageUrl?: string
    isDemo?: boolean

    responsesCollectionName?: string
    normalizedCollectionName?: string

    emailOctopus: EmailOctopusData

    partners: [SponsorItem]
}

export interface EmailOctopusData {
    listId: string
    submitUrl: string
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
    feedbackAt: string
    releasedAt: string
    // TODO: maybe we should use a string here, so we can have "Summer 2023" instead of "2023"
    // it's never really used as a number in the code
    year: number
    credits: Credit[]
    resultsUrl: string
    resultsStatus: ResultsStatus
    questionsUrl: string
    issuesUrl?: string
    discordUrl?: string
    feedbackUrl: string
    imageUrl: string
    socialImageUrl: string
    faviconUrl: string
    status: SurveyStatus
    tshirt: Tshirt
    colors: Colors
    sponsors?: SponsorItem[]
    enableReadingList?: boolean
    enableChartSponsorships?: boolean
    enableSkip?: boolean
    enableGoal?: boolean
    enableScore?: boolean
    responsesGoal?: number
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
export type ResultsStatus = 1 | 2 | 3
export type SurveyStatusLabel = 'preview' | 'open' | 'closed' | 'hidden'

export enum SurveyStatusEnum {
    PREVIEW = 1,
    OPEN = 2,
    CLOSED = 3,
    HIDDEN = 4
}

export enum ResultsStatusEnum {
    HIDDEN = 1,
    PREVIEW = 2,
    PUBLISHED = 3
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
    company?: Entity
}

/**
 * See for actual usagequestions.yml
 * and surveyform/src/lib/customComponents.ts for correspondance with form inputs
 */
export type TemplateKind =
    | 'single'
    | 'multiple'
    | 'feature'
    | 'others'
    | 'tool'
    | 'tools_others'
    | 'textList'
    | string // TODO: try to type all possible templates explicitely

export type Section = {
    id: string
    apiOnly: boolean
    messageId?: string
    intlId?: string
    slug: string // TODO: maybe get rid of this?
    questions: Question[]
    /**
     * Define a default template for all questions in this section
     **/
    template?: TemplateKind
}

export type ApiSection = {
    id: string
    questions: ApiQuestion[]
}

export type ApiQuestion = {
    id: string
    template?: string
}

export enum OptionsOrder {
    SPECIFIED = 'specified',
    RANDOM = 'random',
    ALPHA = 'alphabetical'
}

export const sortProperties = {
    OPTIONS: 'options',
    COUNT: 'count',
    PERCENT: 'percent',
    ID: 'id',
    AVERAGE_BY_FACET: 'averageByFacet',
    MEAN: 'mean'
} as const

export type SortProperty = (typeof sortProperties)[keyof typeof sortProperties]

export type SortOrder = 'asc' | 'desc'
export type SortOrderNumeric = 1 | -1

/**
 * Keep in sync with QuestionMetadata in
 * api/src/graphql/typedefs/schema.graphql
 *
 */
export type Question = {
    template: TemplateKind
    // override the template
    inputComponent?: string

    id?: string
    intlId?: string
    // override the sectionId (e.g. to save data to another section)
    sectionId?: string
    label?: string
    yearAdded?: number
    options?: Option[]
    // options/values for the question are numeric
    optionsAreNumeric?: boolean
    // options are ranges of numbers
    optionsAreRange?: boolean
    // options follow each other sequentially
    optionsAreSequential?: boolean
    defaultSort?: SortProperty

    groups?: OptionGroup[]

    // how many options can be selected
    limit?: number
    /**
     * How many options to show before "show more…" button (set to 99 to always show all)
     *
     * Used in "multiple" / "multipleWithOther" questions
     * Corresponding to CheckboxGroup component
     */
    cutoff?: number

    // typically the question id is used as the question "namespace", this can override it
    i18nNamespace?: string

    // for slider questions
    from?: number
    to?: number

    // a question that has a data field but does not show up in the form
    hidden?: boolean
    isRequired?: boolean
    /**
     * Must be true for questions that allow multiple answers
     * For instance "textList"
     */
    allowMultiple?: boolean
    /**
     * For single and multiple question
     * "multipleWithOther" is a shortcut to "multiple" + allowOther=true
     */
    allowOther?: boolean
    allowPrenormalized?: boolean
    allowComment?: boolean
    showCommentInput?: boolean
    randomize?: boolean
    order?: OptionsOrder
    /**
     * Question is used to compute the knowledge score
     */
    countsTowardScore?: boolean

    // whether to match a single value, or multiple. Defaults to multiple
    matchType?: 'single' | 'multiple'
    matchTags?: string[]
    disallowedTokenIds?: string[]

    // a question that's in the outline but not in the API
    hasApiEndpoint?: boolean

    followups?: Followups[]

    // To use a textarea in TextList
    longText?: boolean

    // for numerical questions, specify value units
    units?: NumericalUnits
}

export enum NumericalUnits {
    YEARS = 'years',
    YEARS_OLD = 'years_old',
    HOURS = 'hours'
}

export type Option = {
    id: OptionId
    value?: number
    intlId?: string
    editions?: string[]
    average?: number
    label?: string
    lowerBound?: number
    upperBound?: number
}

export type OptionId = string | number

// used to regroup multiple datapoints under a single datapoint
export interface OptionGroup {
    id: string
    average?: number
    lowerBound?: number
    upperBound?: number
    items?: string[]
    label?: string
}

export type ParentIdGroup = Pick<OptionGroup, 'id' | 'items' | 'label'>

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
    FOLLOWUPS = 'followups',
    FOLLOWUP_PREDEFINED = 'followup_predefined',
    FOLLOWUP_FREEFORM = 'followup_freeform',
    ERROR = 'error',
    // PATTERNS = 'patterns',
    RAW = 'raw',
    METADATA = 'metadata',
    SENTIMENT = 'sentiment'
}

// once a question has gone through a template it should always have an id
// if we know an ID exists we can use this type to cast the object
export interface QuestionWithId extends Omit<Question, 'id'> {
    id: string
}

export interface QuestionWithSection extends QuestionWithId {
    section: SectionMetadata
}

export interface QuestionTemplateOutput extends QuestionWithId {
    rawPaths?: DbPaths
    normPaths?: DbPaths
    options?: Option[]
    extends?: string
    filterFunction?: (value: any) => boolean
}

export interface QuestionTemplateOutputWithSection extends QuestionTemplateOutput {
    section: SectionMetadata
}

export type Followups = {
    id: string
    options: FollowupOption[]
}

export type FollowupOption = {
    id: string
}

export type TemplateFunction = (arg0: TemplateArguments) => QuestionTemplateOutput
