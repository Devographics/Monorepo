export { Filters, Filter } from '@devographics/types'

export interface FilterQuery<T> {
    // must equal value
    $eq?: T
    // must be one of given values
    $in?: T[]
    // must not be one of given values
    $nin?: T[]
    // lower than
    $lt?: T
    // greater than
    $gt?: T
}

export type DbMatch = {
    surveyId: string
} & { [key: string]: MatchNin }

export type FiltersQuery = {
    $and: Array<FiltersQueryOr>
}

export type MatchNin = {
    $nin: [null, '', [], {}]
}

export type FiltersQueryOr = { $or?: Array<FilterQuery<string | number>> }
