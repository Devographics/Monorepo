import { loadOrGetSurveys } from './load/surveys'
import { getQuestionObjects } from './generate/generate'
import { Filter, Filters, FilterQuery, FiltersQuery, ComputeAxisParameters } from './types'
import { OptionGroup } from '@devographics/types'
import range from 'lodash/range.js'
import { getMainSubfieldPath } from './helpers/surveys'

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

/*
                    
Expand filter groups from e.g. { eq: 'range_30_34' } to 
{ in: [30, 31, 32, 34] }

*/
function expandFilterGroups(filterValues: Array<string | number>, groups: OptionGroup[]) {
    let allValues: Array<string | number> = []
    for (const value of filterValues) {
        const group = groups.find(g => g.id === value)
        if (!group) {
            console.log({ filterValues })
            console.log({ groups })
            throw new Error(`expandFilterGroups: could not find group with id ${value}`)
        }
        const { items, lowerBound, upperBound } = group
        if (items) {
            allValues = [...allValues, ...items]
        } else if (lowerBound && upperBound) {
            allValues = [...allValues, ...range(lowerBound, upperBound)]
        }
    }
    return allValues
}

function expandFilter(filter: Filter<string | number>, groups: OptionGroup[]) {
    let newFilter: Filter<string | number> = {}
    if (filter.eq || filter.in) {
        let eqInFilters: Array<string | number> = []
        if (filter.eq) {
            eqInFilters = [filter.eq]
        }
        if (filter.in) {
            eqInFilters = [...eqInFilters, ...filter.in]
        }
        newFilter.in = expandFilterGroups(eqInFilters, groups)
    }
    if (filter.nin) {
        newFilter.nin = expandFilterGroups(filter.nin, groups)
    }
    return newFilter
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
    const { surveys } = await loadOrGetSurveys()
    const questionObjects = getQuestionObjects({ surveys })

    const match: FiltersQuery = {}
    if (filters) {
        for (const filterKey of Object.keys(filters)) {
            const [sectionId, filterId] = filterKey.split('__')
            const filterField = questionObjects.find(q => q.id === filterId)
            if (!filterField) {
                throw new Error(`generateFiltersQuery: could not find question with id ${filterId}`)
            }
            const filter = filters[filterKey]
            const subFieldPath = getMainSubfieldPath(filterField)
            if (subFieldPath) {
                if (filterField.groups) {
                    match[subFieldPath] = mapFilter<string | number>(
                        expandFilter(filter, filterField.groups)
                    )
                } else {
                    match[subFieldPath] = mapFilter<string | number>(filter)
                }
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
