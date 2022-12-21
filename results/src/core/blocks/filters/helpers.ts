import { usePageContext } from 'core/helpers/pageContext'
import { getGraphQLQuery } from 'core/blocks/block/BlockData'
import { addNoAnswerBucket } from 'core/blocks/generic/VerticalBarBlock'

export const useKeys = () => {
    const context = usePageContext()
    const { metadata } = context
    const { keys } = metadata
    return keys
}

export const getNewCondition = ({ filtersNotInUse, keys }) => {
    const field = filtersNotInUse[0]
    return { field, operator: 'eq', value: keys?.[field]?.[0] }
}

export const getNewSeries = ({ filters, keys }) => {
    const filtersNotInUse = filters
    return { conditions: [getNewCondition({ filtersNotInUse, keys })] }
}

// TODO: do this better without relying on magic character counts
export const getFiltersQuery = ({ block, series = [] }) => {
    const query = getGraphQLQuery(block)
    const idIndex = query.indexOf(`${block.id}: `)
    const queryHeader = query.slice(0, idIndex)
    const queryContents = query.slice(idIndex, query.length - 10)
    const queryFooter = `
        }
    }
}`
    const newQuery =
        queryHeader +
        series
            .map((singleSeries, seriesIndex) => {
                // {gender: {eq: male}, company_size: {eq: range_1}}
                const filterObject = {}
                singleSeries.conditions.forEach(condition => {
                    const { field, operator, value } = condition
                    filterObject[field] = { [operator]: value }
                })
                return queryContents
                    .replace(`${block.id}: `, `${block.id}_${seriesIndex + 1}: `)
                    .replace(
                        'filters: {}',
                        `filters: ${JSON.stringify(filterObject).replaceAll('"', '')}`
                    )
            })
            .join('') +
        queryFooter
    return newQuery
}

/*

Take multiple buckets arrays and merge them into a array with
multiple series (e.g. { count, count_1, percentage_question, percentage_question_1, etc. })

*/
const fields = ['count', 'percentage_question', 'percentage_survey']
export const mergeBuckets = ({ bucketsArrays, completion }) => {
    const [baseBucketsArray, ...otherBucketsArrays] = bucketsArrays
    otherBucketsArrays.forEach((buckets, index) => {
        // default series is series 1, first custom series is series 2, etc.
        const seriesIndex = index + 2
        // TODO: add this later
        // const bucketsWithNoAnswerBucket = addNoAnswerBucket({ buckets, completion })
        baseBucketsArray.forEach(bucket => {
            const { id } = bucket
            const otherSeriesBucket = buckets.find(b => b.id === id)
            if (otherSeriesBucket) {
                fields.forEach(field => {
                    bucket[`${field}__${seriesIndex}`] = otherSeriesBucket[field]
                })
            }
        })
    })
    return baseBucketsArray
}

export const getFieldLabel = ({ getString, field }) => getString(`user_info.${field}`)?.t

export const getValueLabel = ({ getString, field, value }) =>
    getString(`options.${field}.${value}`)?.t
