// // import { ResolverDynamicConfig } from '.'

// import { Entity } from '@devographics/core-models'
import { Filters } from './filters'

export interface GenericComputeParameters {
    // filter aggregations
    filters?: Filters
    // sort?: string
    // order?: -1 | 1
    sort?: SortSpecifier
    facetSort?: SortSpecifier
    year?: number
    keys?: string[]
    // keysFunction?: (arg0: ResolverDynamicConfig) => Promise<string[]>
    facet?: string
    // bucket
    cutoff?: number
    limit?: number
    // facet
    facetLimit?: number
    facetMinPercent?: number
    facetMinCount?: number
    facet1keys?: string[]
    facet2keys?: string[]
}

export interface SortSpecifier {
    property: string
    order: 'asc' | 'desc'
}

// export interface ResultsByYear {
//     year: number
//     facets: FacetItem[]
//     completion: YearCompletion
// }

// export interface FacetItem {
//     mean?: number
//     type: Facet
//     id: number | string
//     buckets: BucketItem[]
//     entity?: Entity
//     completion: FacetCompletion
// }

// export interface BucketItem {
//     id: number | string
//     count: number
//     // percentage?: number
//     // percentage_survey?: number

//     // percentage relative to the number of question respondents
//     percentage_question: number
//     // percentage relative to the number of respondents in the facet
//     percentage_facet: number
//     // percentage relative to the number of respondents in the survey
//     percentage_survey: number

//     // count when no facet is selected
//     count_all_facets: number
//     // percentage relative to the number
//     percentage_all_facets: number

//     entity?: Entity
// }

// export interface RawResult {
//     id: number | string
//     entity?: Entity
//     year: number
//     count: number
// }

// export interface TermBucket {
//     id: number | string
//     entity?: any
//     count: number
//     countDelta?: number
//     percentage: number
//     percentage_survey?: number
//     percentageDelta?: number
// }

// export interface YearAggregations {
//     year: number
//     total: number
//     completion: YearCompletion
//     buckets: TermBucket[]
// }

// export type AggregationFunction = (funcOptions: {
//     context: RequestContext
//     survey: SurveyConfig
//     key: string
//     options: TermAggregationOptions
// }) => Promise<any>
