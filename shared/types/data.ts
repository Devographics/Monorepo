import { ResultsSubFieldEnum } from './api'
import { Entity } from './entities'
import { Option } from './outlines'

export type QueryData<T> = {
    surveys: SurveysData<T>
}
export type SurveysData<T> = {
    [key: string]: EditionData<T>
}
export type EditionData<T> = {
    [key: string]: SectionData<T>
}

export type SectionData<T> = {
    [key: string]: T
}

export interface QuestionData {
    id: string
}

export type AllQuestionData =
    | StandardQuestionData
    | OptionsQuestionData
    | FreeformQuestionData
    | ToolQuestionData
    | FeatureQuestionData
    | ToolRatiosQuestionData
    | OpinionQuestionData

export type StandardQuestionData = QuestionData & {
    [key in ResultsSubFieldEnum]: ResponseData
}

export interface OpinionQuestionData extends StandardQuestionData {}

export interface OptionsQuestionData extends QuestionData {
    options: OptionData[]
    responses: ResponseData
}

export interface FreeformQuestionData extends QuestionData {
    responses: ResponseData
}

export interface ToolQuestionData extends QuestionData {
    id: string
    comments: ItemComments
    entity: Entity
    responses: ResponseData
}

export interface FeatureQuestionData extends ToolQuestionData {}

export interface ItemComments {
    allEditions: EditionComments[]
    currentEdition: EditionComments
}

export interface EditionComments {
    year: number
    count: number
    commentsRaw: Comment[]
}

export interface Comment {
    message: string
    responseId: string
}

export interface ResponseData {
    allEditions: [ResponseEditionData]
    currentEdition: ResponseEditionData
}

export interface ResponseEditionData {
    editionId: string
    year: number
    completion: YearCompletion
    buckets: Bucket[]
}

export interface OptionData extends Option {
    entity: Entity
}

export interface YearCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number
    // percentage of respondents compared to the total number of participants
    percentageSurvey: number
}

export interface FacetCompletion extends YearCompletion {
    // percentage of respondents compared to the total number of participants
    percentageQuestion: number
}

export enum BucketUnits {
    COUNT = 'count',
    PERCENTAGE_FACET = 'percentageFacet',
    PERCENTAGE_QUESTION = 'percentageQuestion',
    PERCENTAGE_SURVEY = 'percentageSurvey',
    PERCENTAGE_BUCKET = 'percentageBucket',
    AVERAGE = 'averageByFacet',
    PERCENTILES = 'percentilesByFacet'
}

export enum Percentiles {
    P0 = 'p0',
    p25 = 'p25',
    p50 = 'p50',
    p75 = 'p75',
    p100 = 'p100'
}

export type PercentileData = {
    [key in Percentiles]: number
}

export enum OtherPercentages {
    WOULD_NOT_USE_PERCENTAGE = 'would_not_use_percentage',
    NOT_INTERESTED_PERCENTAG = 'not_interested_percentage',
    WOULD_USE_PERCENTAGE = 'would_use_percentage',
    INTERESTED_PERCENTAGE = 'interested_percentage'
}

export type BucketData = {
    [key in Exclude<BucketUnits, BucketUnits.PERCENTILES>]?: number
}

export interface Bucket extends BucketData {
    id: string
    completion?: BucketCompletion
    entity?: Entity
    facetBuckets: FacetBucket[]
    percentilesByFacet?: PercentileData
    label?: string
}

export type CombinedBucketData = {
    [key in BucketUnits as `${key}__${number}`]: number
}

export interface CombinedBucket extends Bucket, CombinedBucketData {}

export interface FacetBucket extends Omit<Bucket, 'facetBuckets'> {}

export interface FacetBucketWithAverage extends FacetBucket {
    average: number
}

export interface BucketCompletion extends FacetCompletion {}

/*

Ratios

*/
export interface ToolRatiosQuestionData {
    items: ToolRatiosItemData[]
    ids: string[]
    years: number[]
}

export enum RatiosUnits {
    AWARENESS = 'awareness',
    USAGE = 'usage',
    INTEREST = 'interest',
    SATISFACTION = 'satisfaction'
}

export type ToolRatiosItemDataFields = {
    [key in RatiosUnits]: [ToolRatiosItemEditionData]
}

export interface ToolRatiosItemData extends QuestionData, ToolRatiosItemDataFields {
    entity: Entity
}

export interface ToolRatiosItemEditionData {
    year: number
    editionId: string
    rank: number
    percentageQuestion: number
}

/*

All tools in a section

*/

export interface AllToolsData {
    items: ToolQuestionData[]
    ids: string[]
    years: number[]
}
export interface SectionAllToolsData extends AllToolsData {}
export interface AllFeaturesData extends AllToolsData {}
export interface SectionAllFeaturesData extends AllFeaturesData {}

export const OPTION_NA = 'na'

export enum ToolsOptions {
    WOULD_USE = 'would_use',
    WOULD_NOT_USE = 'would_not_use',
    INTERESTED = 'interested',
    NOT_INTERESTED = 'not_interested',
    NEVER_HEARD = 'never_heard'
}

export enum FeaturesOptions {
    NEVER_HEARD = 'never_heard',
    HEARD = 'heard',
    USED = 'used'
}

export enum SentimentOptions {
    INTERESTED = 'sentiment_interested',
    NOT_INTERESTED = 'sentiment_not_interested',
    POSITIVE_EXPERIENCE = 'sentiment_positive_experience',
    NEGATIVE_EXPERIENCE = 'sentiment_negative_experience'
}

/*

Explorer

*/

export interface ExplorerData {
    items: ResponseEditionData[]
}
