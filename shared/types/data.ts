import { Entity } from './entities'

export interface EditionData {
    editionId: string
    year: number
    completion: YearCompletion
    buckets: Bucket[]
}

export interface YearCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number
    // percentage of respondents compared to the total number of participants
    percentage_survey: number
}

export interface FacetCompletion extends YearCompletion {
    // percentage of respondents compared to the total number of participants
    percentage_question: number
}

export interface Bucket {
    count: number
    id: string
    percentage_facet?: number
    percentage_question: number
    percentage_survey: number
    completion?: BucketCompletion
    entity?: Entity
    facetBuckets: FacetBucket[]
}

export interface FacetBucket extends Omit<Bucket, 'facetBuckets'> {}

export interface BucketCompletion extends FacetCompletion {}
