import { loadOrGetSurveys } from './load/surveys'
import { getQuestionObjects } from './generate/generate'
import {
    Filter,
    Filters,
    FilterQuery,
    FiltersQuery,
    ComputeAxisParameters,
    FiltersQueryOr,
    MatchNin,
    QuestionApiObject
} from './types'
import { MongoCondition, OptionGroup } from '@devographics/types'
import range from 'lodash/range.js'
import { getMainSubfieldPath } from './helpers/surveys'
import merge from 'lodash/merge.js'
import clone from 'lodash/clone.js'
import { ninObject } from './compute'

/**
 * Map natural operators (exposed by the API), to MongoDB operators.
 *
 * input:
 *
 * {
 *   in: [4, 5, 6],
 *   gt: 7
 * }
 *
 * output:
 *
 * [
 *   { $in: [4,5,6]},
 *   { $gt: 7}
 * ]
 */

type FilterValue<T> = T | null | '' | [] | {}

const mapFilter = <T>(filter: Filter<T>) => {
    const { eq, /* in, */ nin, lt, gt } = filter
    const conditions: Array<MongoCondition<FilterValue<T>>> = []
    if (eq !== undefined) {
        conditions.push({ $eq: eq })
    }
    if (filter.in !== undefined) {
        if (!Array.isArray(filter.in)) {
            throw new Error(`'in' operator only supports arrays`)
        }
        conditions.push({ $in: filter.in })
    }
    if (nin !== undefined) {
        if (!Array.isArray(nin)) {
            throw new Error(`'nin' operator only supports arrays`)
        }
        /*

        Whenever we use a negative $nin condition, we need to make sure
        that fiels is not empty. Otherwise { gender: { $nin: ['male']}}
        would also match fields where gender is not defined at all, 
        which is probably not what we want. 

        */
        conditions.push({ $nin: [...nin, null, '', [], {}] })
    }
    if (lt !== undefined) {
        conditions.push({ $lt: lt })
    }
    if (gt !== undefined) {
        conditions.push({ $gt: gt })
    }
    return conditions
}

/*

Take an option group and expand it into its individual items – or
gt/lt bounds for an open group (e.g. "range_over_20")

TODO: in theory, {in: [4, 5, 6, 7, 8]} could be replaced by {gt: 4, lt: 9}
but then how to handle discoutinous series? (e.g. [2, 5, 10] ?)

*/
function expandGroup(group: OptionGroup, isNin: boolean = false) {
    const filter: Filter<string | number> = {}
    const { items, lowerBound, upperBound } = group
    if (isNin) {
        // this is a "not in" group, so we *exclude* items
        if (items) {
            // group has items; keep everything that *doesn't* match those items
            filter.nin = items
        } else if (lowerBound && upperBound) {
            // group has both bounds defined; keep everything that *isn't* in between
            filter.nin = range(lowerBound, upperBound)
        } else if (lowerBound) {
            // group only has lower bound; keep everything under
            filter.lt = lowerBound
        } else if (upperBound) {
            // group only has upper bound; keep everything above
            filter.gt = upperBound
        }
    } else {
        if (items) {
            // group has items; keep everything that matches those items
            filter.in = items
        } else if (lowerBound && upperBound) {
            // group has both bounds defined; keep everything in between
            filter.in = range(lowerBound, upperBound)
        } else if (lowerBound) {
            // group only has lower bound; keep everything above
            filter.gt = lowerBound
        } else if (upperBound) {
            // group only has upper bound; keep everything under
            filter.lt = upperBound
        }
    }
    return filter
}

/*

Merge two sets of filters while properly concatenating in/nin fields

*/
function mergeFilters(
    currentFilters: Filter<string | number>,
    newFilters: Filter<string | number>
) {
    const mergedFilters = clone(currentFilters)
    if (newFilters.eq) {
        if (currentFilters.eq) {
            console.warn(
                `mergeFilters: {eq: ${currentFilters.eq}} will be overwritten by {eq: ${newFilters.eq}}`
            )
        }
        mergedFilters.eq = newFilters.eq
    }
    if (newFilters.gt) {
        if (currentFilters.gt) {
            console.warn(
                `mergeFilters: {gt: ${currentFilters.gt}} will be overwritten by {gt: ${newFilters.gt}}`
            )
        }
        mergedFilters.gt = newFilters.gt
    }
    if (newFilters.lt) {
        if (currentFilters.lt) {
            console.warn(
                `mergeFilters: {lt: ${currentFilters.lt}} will be overwritten by {lt: ${newFilters.lt}}`
            )
        }
        mergedFilters.lt = newFilters.lt
    }
    if (newFilters.in) {
        mergedFilters.in = [...(currentFilters.in || []), ...newFilters.in]
    }
    if (newFilters.nin) {
        mergedFilters.nin = [...(currentFilters.nin || []), ...newFilters.nin]
    }
    return mergedFilters
}

function expandFilter(filter: Filter<string | number>, groups?: OptionGroup[]) {
    let newFilter: Filter<string | number> = {}
    const getGroup = (value: string | number) => groups?.find(g => g.id === value)
    if (filter.eq) {
        const group = getGroup(filter.eq)
        if (group) {
            const groupFilter = expandGroup(group)
            newFilter = mergeFilters(newFilter, groupFilter)
        } else {
            newFilter.eq = filter.eq
        }
    }
    if (filter.in) {
        filter.in.forEach(value => {
            const group = getGroup(value)
            if (group) {
                const groupFilter = expandGroup(group)
                newFilter = mergeFilters(newFilter, groupFilter)
            } else {
                newFilter = mergeFilters(newFilter, { in: [value] })
            }
        })
    }
    if (filter.nin) {
        filter.nin.forEach(value => {
            const group = getGroup(value)
            if (group) {
                const groupFilter = expandGroup(group, true)
                newFilter = mergeFilters(newFilter, groupFilter)
            } else {
                newFilter = mergeFilters(newFilter, { nin: [value] })
            }
        })
    }
    return newFilter
}

/**
 * Generate a MongoDB $match query from filters object.
 *
 * input:
 *
 * {
 *   in: [ range_10_12, range_13_15, range_16_20, range_over_20],
 * }
 *
 * output:
 *
 *    {
 *      "surveyId": "tokyodev",
 *      "editionId": "td2024",
 *      "employer_info.current_employer.choices": {
 *        "$nin": [null, "", [], {}]
 *      },
 *      "$and": [
 *        "$or": [
 *           {
 *             "user_info.years_of_experience.choices": {
 *               "$in": [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
 *             }
 *           },
 *           {
 *             "user_info.years_of_experience.choices": {
 *               "$gt": 20
 *             }
 *           }
 *         ]
 *       ]
 *    }
 *
 *
 */
export const generateFiltersQuery = ({
    filters,
    surveyId,
    questionObjects
}: {
    filters?: Filters
    surveyId: string
    questionObjects: QuestionApiObject[]
}): FiltersQuery => {
    const match: FiltersQuery = { $and: [] }
    if (filters) {
        for (const filterKey of Object.keys(filters)) {
            const [sectionId, filterId] = filterKey.split('__')
            const filterField = questionObjects.find(
                q => q.id === filterId && q.surveyId === surveyId
            )
            if (!filterField) {
                throw new Error(`generateFiltersQuery: could not find question with id ${filterId}`)
            }
            const filter = filters[filterKey]
            const subFieldPath = getMainSubfieldPath(filterField)
            if (subFieldPath) {
                const expandedFilters = expandFilter(filter, filterField.groups)
                const conditions = mapFilter<string | number>(expandedFilters)
                match.$and.push({ $or: conditions.map(c => ({ [subFieldPath]: c })) })
            }
        }
    }

    return match
}
