import { loadOrGetSurveys } from './load/surveys'
import { getQuestionObjects } from './generate/generate'
import { Filter, Filters, FilterQuery, FiltersQuery } from './types'

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
            if (filterField?.dbPath) {
                match[filterField.dbPath] = mapFilter<string>(filters[filterKey])
            }
        }
        if (filters.ids !== undefined && dbPath) {
            match[dbPath] = mapFilter(filters.ids)
        }
        if (filters.locale !== undefined) {
            /*

            Note: this logic is only needed because the current system only supports enums
            as filters, not strings (for compatibility with the filtering UI)

            */
            const cleanedUpFilters = {}
            const cleanUp = (s: string) => s.replace('_', '-')
            Object.keys(filters.locale).forEach(k => {
                const filterValues = filters.locale[k]
                cleanedUpFilters[k] = Array.isArray(filterValues)
                    ? filterValues.map(cleanUp)
                    : cleanUp(filterValues)
            })
            match['user_info.locale'] = mapFilter(cleanedUpFilters)
        }
    }

    return match
}
