import { getGraphQLQuery } from 'core/blocks/block/BlockData'
import { addNoAnswerBucket } from 'core/blocks/generic/VerticalBarBlock'
import { getCountryName } from 'core/helpers/countries'
import cloneDeep from 'lodash/cloneDeep.js'
import isEmpty from 'lodash/isEmpty'
import { CustomizationDefinition, CustomizationOptions } from './types'
import { BlockDefinition } from 'core/types'
import { MODE_DEFAULT, MODE_FACET, MODE_FILTERS } from './constants'
import { useI18n } from 'core/i18n/i18nContext'
import { useTheme } from 'styled-components'
import round from 'lodash/round'
import { useAllChartsKeys } from 'core/charts/hooks'

export const getNewCondition = ({ filtersNotInUse, keys }) => {
    const field = filtersNotInUse[0]
    return { field, operator: 'eq', value: keys?.[field]?.[0] }
}

export const getNewSeries = ({ filters, keys, year }) => {
    const filtersNotInUse = filters
    return { year, conditions: [getNewCondition({ filtersNotInUse, keys })] }
}

const startMarker = '# fragmentStart'
const endMarker = '# fragmentEnd'

export const getFiltersQuery = ({
    block,
    chartFilters = {},
    currentYear
}: {
    block: BlockDefinition
    chartFilters: CustomizationDefinition
    currentYear: number
}) => {
    let queryBody
    const query = getGraphQLQuery(block)
    const queryHeader = query.slice(0, query.indexOf(startMarker))
    const queryContents = query.slice(
        query.indexOf(startMarker) + startMarker.length,
        query.indexOf(endMarker)
    )
    const queryFooter = query.slice(query.indexOf(endMarker) + endMarker.length)
    if (chartFilters.options.mode === MODE_FILTERS) {
        queryBody = chartFilters.filters
            .map((singleSeries, seriesIndex) => {
                // {gender: {eq: male}, company_size: {eq: range_1}}
                const filterObject = {}
                singleSeries.conditions.forEach(condition => {
                    const { field, operator, value } = condition
                    filterObject[field] = { [operator]: value }
                })
                const seriesName = `${block.id}_${seriesIndex + 1}`
                return queryContents
                    .replace(`${block.id}: `, `${seriesName}: `)
                    .replace(
                        'filters: {}',
                        `filters: ${JSON.stringify(filterObject).replaceAll('"', '')}`
                    )
                    .replace(`year: ${currentYear}`, `year: ${singleSeries.year}`)
            })
            .join('')
    } else if (chartFilters.options.mode === MODE_FACET) {
        queryBody = queryContents.replace('facet: null', `facet: ${chartFilters.facet}`)
    }
    const newQuery = queryHeader + queryBody + queryFooter

    // console.log(newQuery)
    return newQuery
}

const fields = ['count', 'percentage_question', 'percentage_survey']

/*

Take multiple buckets arrays and merge them into a array with
multiple series (e.g. { count, count_1, percentage_question, percentage_question_1, etc. })

*/
export const combineBuckets = ({ defaultBuckets, otherBucketsArrays, completion }) => {
    const mergedBuckets = cloneDeep(defaultBuckets)
    otherBucketsArrays.forEach((buckets = [], index) => {
        // default series is series 0, first custom series is series 1, etc.
        const seriesIndex = index + 1
        // TODO: add this later
        // const bucketsWithNoAnswerBucket = addNoAnswerBucket({ buckets, completion })
        mergedBuckets.forEach(bucket => {
            const { id } = bucket
            const otherSeriesBucket = buckets.find(b => b.id === id)
            if (otherSeriesBucket) {
                fields.forEach(field => {
                    bucket[`${field}__${seriesIndex}`] = otherSeriesBucket[field]
                })
            } else {
                // series might have returned undefined;
                // or else default buckets contains bucket items not in series buckets
                fields.forEach(field => {
                    bucket[`${field}__${seriesIndex}`] = 0
                })
            }
        })
    })
    return mergedBuckets
}

/*

Take an array of facets of the shape:

facets: [
    {
        id: "male"
        buckets: [
            {
                id: "syntaxfm",
                count: 1234,
                // ...
            },
            {
                id: "jsparty",
                count: 1234,
                // ...
            },
            // ...
        ]
    },
    {
        id: "female"
        buckets: [
            {
                id: "syntaxfm",
                count: 1234,
                // ...
            },
            {
                id: "jsparty",
                count: 1234,
                // ...
            },
            // ...
        ]
    }
]

And "invert" it into:

buckets: [
    {
        id: "syntaxfm",
        count: 1234,
        count__male: 923
        count__female: 123
        // ...
    },
    {
        id: "jsparty",
        count: 1234,
        count__male: 923
        count__female: 123
        // ...
    },
    // ...
]
    
*/
export const invertFacets = ({ facets, defaultBuckets }) => {
    const newBuckets = cloneDeep(defaultBuckets)
    facets.forEach(facet => {
        facet.buckets.forEach(facetBucket => {
            const baseBucket = newBuckets.find(b => b.id === facetBucket.id)
            fields.forEach(field => {
                baseBucket[`${field}__${facet.id}`] = facetBucket[field]
            })
            baseBucket[`percentage_bucket__${facet.id}`] = round(
                (facetBucket.count * 100) / baseBucket.count,
                2
            )
        })
    })
    return newBuckets
}

export const getFieldLabel = ({ getString, field }) => getString(`user_info.${field}`)?.t

export const getValueLabel = ({ getString, field, value }) =>
    field === 'country' ? getCountryName(value) || value : getString(`options.${field}.${value}`)?.t

export const useFilterLegends = ({
    chartFilters,
    currentYear,
    showDefaultSeries,
    reverse = false
}: {
    chartFilters: any
    currentYear?: number
    showDefaultSeries?: boolean
    reverse?: boolean
}) => {
    const allChartKeys = useAllChartsKeys()
    const theme = useTheme()
    const { getString } = useI18n()
    let results
    if (chartFilters.options.mode === MODE_FILTERS) {
        if (!chartFilters.filters || chartFilters.filters.length === 0) {
            return []
        } else {
            const showYears = chartFilters.filters.some(s => s.year !== currentYear)

            const defaultLabel = showYears
                ? getString('filters.series.year', { values: { year: currentYear } })?.t
                : getString('filters.legend.default')?.t
            const defaultLegendItem = {
                color: theme.colors.barColors[0].color,
                gradientColors: theme.colors.barColors[0].gradient,
                id: 'default',
                label: defaultLabel,
                shortLabel: defaultLabel
            }

            const seriesLegendItems = chartFilters.filters.map((seriesItem, seriesIndex) => {
                let labelSegments = []
                if (showYears) {
                    // if at least one series is showing a different year, add year to legend
                    labelSegments.push(
                        getString('filters.series.year', { values: { year: seriesItem.year } })?.t
                    )
                }
                if (seriesItem.conditions.length > 0) {
                    // add conditions filters to legend
                    labelSegments = [
                        ...labelSegments,
                        seriesItem.conditions.map(({ field, operator, value }) => {
                            const fieldLabel = getFieldLabel({ getString, field })
                            const valueLabel = getValueLabel({
                                getString,
                                field,
                                value
                            })
                            return `${fieldLabel} = ${valueLabel}`
                        })
                    ]
                }
                const label = labelSegments.join(', ')

                const barColorIndex = seriesIndex + 1
                const legendItem = {
                    color: theme.colors.barColors[barColorIndex].color,
                    gradientColors: theme.colors.barColors[barColorIndex].gradient,
                    id: `series_${seriesIndex}`,
                    label,
                    shortLabel: label
                }
                return legendItem
            })
            results = [...(showDefaultSeries ? [defaultLegendItem] : []), ...seriesLegendItems]
        }
    } else if (chartFilters.options.mode === MODE_FACET) {
        results = allChartKeys[chartFilters.facet].map((key, index) => {
            const label = getString(`options.${chartFilters.facet}.${key}`)?.t
            return {
                color: theme.colors.barColors[index + 1].color,
                gradientColors: theme.colors.barColors[index + 1].gradient,
                id: `series_${key}`,
                label,
                shortLabel: label
            }
        })
    } else {
        results = []
    }
    return reverse ? [...results].reverse() : results
}

export const getInitFilters = (initOptions?: CustomizationOptions) => ({
    options: {
        showDefaultSeries: true,
        allowModeSwitch: false,
        mode: MODE_DEFAULT,
        ...initOptions
    },
    filters: []
})
