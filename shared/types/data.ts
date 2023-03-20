import { Entity } from './entities'
import { Option } from './outlines'

export interface QuestionData {
    id: string
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
    options: OptionData[]
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
    allEditions?: [EditionData]
    currentEdition?: EditionData
}

export interface EditionData {
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

export interface Bucket {
    count: number
    id: string
    percentageFacet?: number
    percentageQuestion: number
    percentageSurvey: number
    completion?: BucketCompletion
    entity?: Entity
    facetBuckets: FacetBucket[]
}

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
