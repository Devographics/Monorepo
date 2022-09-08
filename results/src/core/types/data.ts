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

export interface GitHub {
    id: string
    name: string
    full_name?: string
    description: string
    url: string
    stars: number
    forks?: number
    opened_issues?: number
    homepage: string
}

export interface Entity {
    id: string
    aliases?: string[]
    name: string
    otherName: string
    twitterName: string
    category?: string
    description?: string
    tags?: string[]
    match?: string[]
    type?: string
    patterns?: string[]

    homepage?: Homepage
    npm?: Npm
    mdn?: MDN
    caniuse?: CanIUse
    github?: GitHub
}

export interface Homepage {
    name: string
    url: string
}

export interface CanIUse {
    name: string
    url: string
}

export interface Npm {
    name: string
    url: string
}

export interface MDN {
    name: string
    url: string
}

export type BucketItem = DefaultBucketItem | RatioBucketItem

export interface DefaultBucketItem {
    id: number | string
    count: number

    // percentage relative to the number of respondents in the survey
    percentage_survey: number
    // percentage relative to the number of question respondents
    percentage_question: number
    // percentage relative to the number of respondents in the facet
    percentage_facet?: number

    // count when no facet is selected
    count_all_facets?: number
    // percentage relative to the number
    percentage_all_facets?: number

    entity?: Entity
}

export interface RatioBucketItem {
    id: number | string

    interest_percentage?: number
    satisfaction_percentage?: number
    awareness_percentage?: number
    usage_percentage?: number

    entity?: Entity
}

export interface FacetItem {
    type: Facet
    id: number | string
    buckets: BucketItem[]
    entity?: Entity
    completion: FacetCompletion
}

export interface ResultsByYear {
  year: number
  facets: FacetItem[]
  completion: YearCompletion
}

/**
 * Used to represent survey question completion.
 */
export interface YearCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number
    // percentage of respondents compared to the total number of participants
    percentage_survey: number
}

export interface FacetCompletion {
    // total number of participants
    total: number
    // current number of respondents
    count: number
    // percentage of respondents compared to the total number of participants
    percentage_question: number
    // percentage of respondents compared to the total number of participants
    percentage_survey: number
}
