import { FacetCompletion, YearCompletion } from '@types/index'

export interface OpinionBucket {
    id: 0 | 1 | 2 | 3 | 4
    count: number
    percentageSurvey: number
    percentageQuestion: number
    percentageFacet: number
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
