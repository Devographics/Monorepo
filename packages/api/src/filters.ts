export interface Filter<T> {
    // must equal value
    eq?: T
    // must be one of given values
    in?: T[]
    // must not be one of given values
    nin?: T[]
}

export interface Filters {
    gender?: Filter<string>
    country?: Filter<string>
    race_ethnicity?: Filter<string>
    industry_sector?: Filter<string>
    yearly_salary?: Filter<string>
    company_size?: Filter<string>
    years_of_experience?: Filter<string>
    source?: Filter<string>
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
    'user_info.gender'?: FilterQuery<string>
    'user_info.country_alpha3'?: FilterQuery<string>
    'user_info.race_ethnicity.choices'?: FilterQuery<string>
    'user_info.industry_sector.choices'?: FilterQuery<string>
    'user_info.company_size'?: FilterQuery<string>
    'user_info.yearly_salary'?: FilterQuery<string>
    'user_info.years_of_experience'?: FilterQuery<string>
    'user_info.source.normalized'?: FilterQuery<string>
}

/**
 * Map natural operators (exposed by the API), to MongoDB operators.
 */
const mapFilter = <T>(filter: Filter<T>): FilterQuery<T> => {
    const q: FilterQuery<T> = {}
    if (filter.eq !== undefined) {
        q['$eq'] = filter.eq
    }
    if (filter.in !== undefined) {
        if (!Array.isArray(filter.in)) {
            throw new Error(`'in' operator only supports arrays`)
        }
        q['$in'] = filter.in
    }
    if (filter.nin !== undefined) {
        if (!Array.isArray(filter.nin)) {
            throw new Error(`'nin' operator only supports arrays`)
        }
        q['$nin'] = filter.nin
    }

    return q
}

/**
 * Generate a MongoDB $match query from filters object.
 */
export const generateFiltersQuery = (filters?: Filters): FiltersQuery => {
    const match: FiltersQuery = {}
    if (filters !== undefined) {
        if (filters.gender !== undefined) {
            match['user_info.gender'] = mapFilter<string>(filters.gender)
        }
        if (filters.country !== undefined) {
            match['user_info.country_alpha3'] = mapFilter<string>(filters.country)
        }
        if (filters.race_ethnicity !== undefined) {
            match['user_info.race_ethnicity.choices'] = mapFilter<string>(filters.race_ethnicity)
        }
        if (filters.industry_sector !== undefined) {
            match['user_info.industry_sector.choices'] = mapFilter<string>(filters.industry_sector)
        }
        if (filters.company_size !== undefined) {
            match['user_info.company_size'] = mapFilter<string>(filters.company_size)
        }
        if (filters.yearly_salary !== undefined) {
            match['user_info.yearly_salary'] = mapFilter<string>(filters.yearly_salary)
        }
        if (filters.years_of_experience !== undefined) {
            match['user_info.years_of_experience'] = mapFilter<string>(filters.years_of_experience)
        }
        if (filters.source !== undefined) {
            match['user_info.source.normalized'] = mapFilter<string>(filters.source)
        }
    }

    return match
}
