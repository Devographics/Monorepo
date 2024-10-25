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

export type FiltersQuery = {
    [key: string]: FilterQuery<string | number>
} & {
    $or?: Array<FilterQuery<string | number>>
}
