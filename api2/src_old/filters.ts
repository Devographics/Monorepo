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
    age?: Filter<string>
    locale?: Filter<string>
    disability_status?: Filter<string>
    higher_education_degree?: Filter<string>
    years_of_experience?: Filter<string>
    source?: Filter<string>
    ids?: Filter<string>
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
    'user_info.gender.choices'?: FilterQuery<string>
    'user_info.country_alpha3'?: FilterQuery<string>
    'user_info.race_ethnicity.choices'?: FilterQuery<string>
    'user_info.industry_sector.choices'?: FilterQuery<string>
    'user_info.company_size.choices'?: FilterQuery<string>
    'user_info.yearly_salary.choices'?: FilterQuery<string>
    'user_info.years_of_experience.choices'?: FilterQuery<string>
    'user_info.age.choices'?: FilterQuery<string>
    'user_info.disability_status.choices'?: FilterQuery<string>
    'user_info.higher_education_degree.choices'?: FilterQuery<string>
    'user_info.locale'?: FilterQuery<string>
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
export const generateFiltersQuery = ({ filters, key }: { filters?: Filters, key?: string }): FiltersQuery => {
    const match: FiltersQuery = {}
    if (filters !== undefined) {
        if (filters.ids !== undefined && key) {
            match[key] = mapFilter<string>(filters.ids)
        }
        if (filters.gender !== undefined) {
            match['user_info.gender.choices'] = mapFilter<string>(filters.gender)
        }
        if (filters.race_ethnicity !== undefined) {
            match['user_info.race_ethnicity.choices'] = mapFilter<string>(filters.race_ethnicity)
        }
        if (filters.yearly_salary !== undefined) {
            match['user_info.yearly_salary.choices'] = mapFilter<string>(filters.yearly_salary)
        }
        if (filters.industry_sector !== undefined) {
            match['user_info.industry_sector.choices'] = mapFilter<string>(filters.industry_sector)
        }
        if (filters.disability_status !== undefined) {
            match['user_info.disability_status.choices'] = mapFilter<string>(
                filters.disability_status
            )
        }
        if (filters.company_size !== undefined) {
            match['user_info.company_size.choices'] = mapFilter<string>(filters.company_size)
        }
        if (filters.years_of_experience !== undefined) {
            match['user_info.years_of_experience.choices'] = mapFilter<string>(
                filters.years_of_experience
            )
        }
        if (filters.higher_education_degree !== undefined) {
            match['user_info.higher_education_degree.choices'] = mapFilter<string>(
                filters.higher_education_degree
            )
        }
        if (filters.source !== undefined) {
            match['user_info.source.normalized'] = mapFilter<string>(filters.source)
        }
        if (filters.country !== undefined) {
            match['user_info.country_alpha3'] = mapFilter<string>(filters.country)
        }
        if (filters.age !== undefined) {
            match['user_info.age.choices'] = mapFilter<string>(filters.age)
        }
        if (filters.locale !== undefined) {
            /*

            Note: this logic is only needed because the current system only supports enums
            as filters, not strings (for compatibility with the filtering UI)

            */
            const cleanedUpFilters = {}
            const cleanUp = s => s.replace('_', '-')
            Object.keys(filters.locale).forEach(k => {
                const filterValues = filters.locale[k]
                cleanedUpFilters[k] = Array.isArray(filterValues)
                    ? filterValues.map(cleanUp)
                    : cleanUp(filterValues)
            })
            match['user_info.locale'] = mapFilter<string>(cleanedUpFilters)
        }
    }

    return match
}
