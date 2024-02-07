/**
 * TODO: some are replaced by @devographics/types,
 * which allow us to reuse the types in other apps
 * But some should stay here in results
 */
export type Facet =
    | 'default'
    | 'gender'
    | 'country'
    | 'race_ethnicity'
    | 'yearly_salary'
    | 'company_size'
    | 'years_of_experience'
    | 'source'
    | 'industry_sector'

// export interface GitHub {
//     id: string
//     name: string
//     full_name?: string
//     description: string
//     url: string
//     stars: number
//     forks?: number
//     opened_issues?: number
//     homepage: string
// }

// export interface Entity {
//     id: string
//     aliases?: string[]
//     name: string
//     nameClean: string
//     nameHtml: string
//     otherName: string
//     twitterName: string
//     category?: string
//     description?: string
//     tags?: string[]
//     match?: string[]
//     type?: string
//     patterns?: string[]

//     homepage?: Homepage
//     npm?: Npm
//     mdn?: MDN
//     caniuse?: CanIUse
//     github?: GitHub
// }

// export interface Homepage {
//     name: string
//     url: string
// }

// export interface CanIUse {
//     name: string
//     url: string
// }

// export interface Npm {
//     name: string
//     url: string
// }

// export interface MDN {
//     name: string
//     url: string
// }

// export type BucketItem = DefaultBucketItem | RatioBucketItem

// export interface DefaultBucketItem {
//     id: number | string
//     count: number

//     // percentage relative to the number of respondents in the survey
//     percentageSurvey: number
//     // percentage relative to the number of question respondents
//     percentageQuestion: number
//     // percentage relative to the number of respondents in the facet
//     percentageFacet?: number

//     // count when no facet is selected
//     count_all_facets?: number
//     // percentage relative to the number
//     percentage_all_facets?: number

//     entity?: Entity
//     label?: string
// }

// export interface RatioBucketItem {
//     id: number | string

//     interest_percentage?: number
//     satisfaction_percentage?: number
//     awareness_percentage?: number
//     usage_percentage?: number

//     entity?: Entity
// }

// export interface FacetItem {
//     type: Facet
//     id: number | string
//     buckets: BucketItem[]
//     entity?: Entity
//     completion: FacetCompletion
// }

// /**
//  * Used to represent survey question completion.
//  */
// export interface YearCompletion {
//     // total number of participants
//     total: number
//     // current number of respondents
//     count: number
//     // percentage of respondents compared to the total number of participants
//     percentageSurvey: number
// }

// export interface FacetCompletion {
//     // total number of participants
//     total: number
//     // current number of respondents
//     count: number
//     // percentage of respondents compared to the total number of participants
//     percentageQuestion: number
//     // percentage of respondents compared to the total number of participants
//     percentageSurvey: number
// }

// /*

// An option for a chart

// */
// export interface ChartOptionDefinition {
//     id: string
//     average?: number
// }
