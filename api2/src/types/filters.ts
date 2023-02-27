export interface Filter<T> {
    // must equal value
    eq?: T
    // must be one of given values
    in?: T[]
    // must not be one of given values
    nin?: T[]
}

export interface Filters {
    [key: string]: Filter<string>
}

export interface FilterQuery<T> {
    // must equal value
    $eq?: T
    // must be one of given values
    $in?: T[]
    // must not be one of given values
    $nin?: T[]
}

export interface FiltersQuery {
    [key: string]: FilterQuery<string>
}
