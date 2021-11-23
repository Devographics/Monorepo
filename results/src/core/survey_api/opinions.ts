import { Completion } from 'core/types'

export interface OpinionBucket {
    id: 0 | 1 | 2 | 3 | 4
    count: number
    percentage: number
}

export interface OpinionYearFacet {
    type: string
    id: string
    buckets: OpinionBucket[]
}
export interface OpinionYearData {
    year: number
    total: number
    completion: Completion
    facets: OpinionYearFacet[]
}

export type OpinionAllYearsData = OpinionYearData[]
