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

export interface StandardQuestionData extends QuestionData {
    responses: ResponseData
}

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
    PERCENTAGE_SURVEY = 'percentageSurvey'
}

export type BucketData = {
    [key in BucketUnits]?: number
}

export interface Bucket extends BucketData {
    id: string
    completion?: BucketCompletion
    entity?: Entity
    facetBuckets: FacetBucket[]
}

export type CombinedBucketData = {
    [key in BucketUnits as `${key}__${number}`]: number
}

export interface CombinedBucket extends Bucket, CombinedBucketData {}

export interface FacetBucket extends Omit<Bucket, 'facetBuckets'> {}

export interface BucketCompletion extends FacetCompletion {}

/*

Ratios

*/
export interface ToolRatiosQuestionData {
    items: ToolRatiosItemData[]
    ids: string[]
    years: number[]
}

export interface ToolRatiosItemData extends QuestionData {
    entity: Entity
    awareness: [ToolRatiosItemEditionData]
    usage: [ToolRatiosItemEditionData]
    interest: [ToolRatiosItemEditionData]
    satisfaction: [ToolRatiosItemEditionData]
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
