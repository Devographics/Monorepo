import { SortSpecifier } from './data'
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
    COMBINED = 'combined',
    PRENORMALIZED = 'prenormalized',
    MEDIANS = 'medians',
    OPTIONS = 'options',
    ENTITY = 'entity',
    ID = 'id',
    METADATA = '_metadata',
    RELEVANT_ENTITIES = 'entities'
}

export const subfieldDocs = {
    [ResultsSubFieldEnum.RESPONSES]:
        'Data resulting from a fixed list of options (e.g. multiple choice questions, dropdown questions, etc. ).',
    [ResultsSubFieldEnum.COMBINED]:
        'Data resulting from a fixed list of options and freeform text fields combined.',
    [ResultsSubFieldEnum.COMMENTS]: 'Optional respondent comments relating to this question.',
    [ResultsSubFieldEnum.FREEFORM]:
        'Data resulting from a freeform text area or multiple freeform fields (and not a fixed list of questions).',
    [ResultsSubFieldEnum.PRENORMALIZED]:
        'Data resulting from a practically unlimited, yet still predefined list of options (such as a list of all Best of JS projects, or all GitHub repos).',
    [ResultsSubFieldEnum.ENTITY]: 'The entity associated with this question.',
    [ResultsSubFieldEnum.OPTIONS]: 'The predefined options associated with this question.',
    [ResultsSubFieldEnum.RELEVANT_ENTITIES]:
        "Relevant entities that could potentially match the question's contents",
    [ResultsSubFieldEnum.FOLLOWUPS]: null,
    [ResultsSubFieldEnum.MEDIANS]: null,
    [ResultsSubFieldEnum.ID]: null,
    [ResultsSubFieldEnum.METADATA]: null
}

export enum DbPathsEnum {
    BASE = 'base',
    CHOICES = 'choices',
    RESPONSE = 'response',
    OTHER = 'other',
    OTHERS = 'others',
    PRENORMALIZED = 'prenormalized',
    COMMENT = 'comment',
    FOLLOWUP_PREDEFINED = 'followup_predefined',
    FOLLOWUP_FREEFORM = 'followup_freeform',
    RAW = 'raw',
    // PATTERNS = 'patterns',
    METADATA = 'metadata',
    ERROR = 'error',
    SUBPATHS = 'subPaths',
    SKIP = 'skip',
    SENTIMENT = 'sentiment',
    EXPERIENCE = 'experience'
}

type DbPathsFirstLevel = Exclude<
    DbPathsEnum,
    // followup questions nest another question within the current one
    DbPathsEnum.FOLLOWUP_PREDEFINED | DbPathsEnum.FOLLOWUP_FREEFORM | DbPathsEnum.SUBPATHS
>

/**
 * Standardized fields that will directly contain a string
 * @example
 * ```
 * {
 *      response: "foobar",
 *      comment: "I am a comment"
 * }
 * ```
 */
export type DbPathsStrings = {
    [key in DbPathsFirstLevel]?: string
}

/**
 * Standardized field path for responses,
 * including first level paths
 * and nesting for followup
 */
export interface DbPaths extends DbPathsStrings {
    [DbPathsEnum.FOLLOWUP_PREDEFINED]?: DbSubPaths
    [DbPathsEnum.FOLLOWUP_FREEFORM]?: DbSubPaths
    [DbPathsEnum.SUBPATHS]?: DbSubPaths
}

export type DbSubPaths = {
    [key in string]: string
}

export type ResponseArguments = {
    responsesType: ResponsesTypes
    filters: Filters
    facet: string
    parameters: ResponsesParameters
    bucketsFilter: Filter<string>
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
    lt?: T
    gt?: T
    hasTags?: T[]
}

export type MongoCondition<T> =
    | { $eq?: T }
    | { $in?: T[] }
    | { $nin?: T[] }
    | { $lt?: T }
    | { $gt?: T }

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
    mergeOtherBuckets?: boolean
}
