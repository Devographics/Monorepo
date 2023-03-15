import { FacetCompletion, YearCompletion } from 'core/types'

export interface OpinionBucket {
    id: 0 | 1 | 2 | 3 | 4
    count: number
    percentage_survey: number
    percentage_question: number
    percentage_facet: number
}

export interface OpinionYearFacet {
    type: string
    id: string
    buckets: OpinionBucket[]
    completion: FacetCompletion
}
export interface OpinionYearData {
    year: number
    completion: YearCompletion
    facets: OpinionYearFacet[]
}

export type OpinionAllYearsData = OpinionYearData[]
