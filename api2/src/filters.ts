import { loadOrGetSurveys } from './surveys'
import { getQuestionObjects } from './generate/generate'

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
export const generateFiltersQuery = async ({
    filters,
    dbPath
}: {
    filters?: Filters
    dbPath?: string
}): Promise<FiltersQuery> => {
    const surveys = await loadOrGetSurveys()
    const questionObjects = getQuestionObjects({ surveys })

    const match: FiltersQuery = {}
    if (filters) {
        for (const filterKey of Object.keys(filters)) {
            const [sectionId, filterId] = filterKey.split('__')
            const filterField = questionObjects.find(q => q.id === filterId)
            match[filterField.dbPath] = mapFilter<string>(filters[filterKey])
        }
        if (filters.ids !== undefined && dbPath) {
            match[dbPath] = mapFilter<string>(filters.ids)
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
