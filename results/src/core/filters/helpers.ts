import { useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep.js'
import {
    CustomizationDefinition,
    CustomizationOptions,
    FilterItem,
    CustomizationFiltersCondition,
    CustomizationFiltersSeries,
    FilterValue,
    FilterValueString,
    OperatorEnum,
    FacetItem,
    DataSeries
} from './types'
import { BlockDefinition, StringTranslator } from 'core/types'
import {
    MODE_DEFAULT,
    MODE_FACET,
    MODE_GRID,
    MODE_COMBINED
    // START_MARKER,
    // END_MARKER
} from './constants'
import { useI18n } from 'core/i18n/i18nContext'
import { useTheme } from 'styled-components'
import round from 'lodash/round'
import { useAllFilters, getVariantBarColorItem } from 'core/charts/hooks'
import sumBy from 'lodash/sumBy'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockLink } from 'core/helpers/blockHelpers'
import { getEntityName, useEntities } from 'core/helpers/entities'
import {
    getBlockQuery,
    getQueryArgsString,
    argumentsPlaceholder,
    bucketFacetsPlaceholder,
    getFacetFragment
} from 'core/helpers/queries'
import { PageContextValue } from 'core/types/context'
import {
    Entity,
    Filters,
    SectionMetadata,
    BucketUnits,
    Bucket,
    CombinedBucket,
    OptionMetadata
} from '@devographics/types'
import { runQuery } from 'core/explorer/data'
// import { spacing, mq, fontSize } from 'core/theme'
import get from 'lodash/get'
import { getBlockDataPath } from 'core/helpers/data'
import { QueryData, AllQuestionData } from '@devographics/types'
import { NO_ANSWER } from '@devographics/constants'
import clone from 'lodash/clone'

export const getNewCondition = ({
    filter,
    option: providedOption
}: {
    filter: FilterItem
    option?: OptionMetadata
}): CustomizationFiltersCondition => {
    const field = filter
    const { id: fieldId, sectionId, options } = field
    const option = providedOption || options[0]
    return {
        fieldId,
        sectionId,
        operator: OperatorEnum['EQ'],
        value: option.id
    }
}

/*

For a given filter field, get a list of all options currently in use

*/
const getOptionsInUse = ({
    filterId,
    filtersState
}: {
    filterId: string
    filtersState: CustomizationDefinition
}) => {
    let optionsInUse: string[] = []
    filtersState.filters.forEach(filter => {
        filter.conditions.forEach(condition => {
            const { fieldId, value } = condition
            if (fieldId === filterId) {
                if (Array.isArray(value)) {
                    optionsInUse = [...optionsInUse, ...value]
                } else {
                    optionsInUse = [...optionsInUse, value]
                }
            }
        })
    })
    return optionsInUse
}

/*

To initialize a new series, either pick the first demographics filter

OR copy the currently defined filters but with the next available option

*/
export const getNewSeries = ({
    filtersState,
    allFilters,
    year
}: {
    filtersState: CustomizationDefinition
    allFilters: FilterItem[]
    year: number
}): CustomizationFiltersSeries => {
    let conditionOptions
    if (filtersState.filters.length === 0) {
        const userInfoFilters = allFilters.filter(f => f.sectionId === 'user_info')
        conditionOptions = { filter: userInfoFilters[0] }
    } else {
        const firstFilter = filtersState.filters[0]
        const firstCondition = firstFilter?.conditions[0]
        const firstConditionField = allFilters.find(
            f => f.id === firstCondition.fieldId
        ) as FilterItem
        const optionsInUse = getOptionsInUse({ filterId: firstCondition.fieldId, filtersState })
        // exclude any option currently in use
        const availableOptions = firstConditionField?.options.filter(
            o => !optionsInUse.includes(o.id)
        )
        // get first available option, unless no option is available
        // in which case just take first option from default list
        const option =
            availableOptions.length > 0 ? availableOptions[0] : firstConditionField?.options[0]

        conditionOptions = { filter: firstConditionField, option }
    }
    return {
        year,
        conditions: [getNewCondition(conditionOptions)]
    }
}

/*

Get a series' name based on its filters

NOT USED

*/
const getSeriesName = ({
    block,
    year,
    conditions
}: {
    block: BlockDefinition
    year: number
    conditions: CustomizationFiltersCondition[]
}) => {
    const suffix = conditions.map(
        ({ fieldId, operator, value }) => `${fieldId}__${operator}__${value.toString()}`
    )
    return `${block.id}___${year}___${suffix}`
}

const cleanUpValue = (s: string) => s?.replaceAll('-', '_')

type FiltersObject = {
    [key: string]: FilterDefinitionObject
}

type FilterDefinitionObject = {
    [key in OperatorEnum]: FilterValue
}

function getNthPosition(s: string, subString: string, count: number, fromEnd = false) {
    const regex = new RegExp(subString, 'g')
    const totalCount = (s.match(regex) || []).length
    const nthIndex = fromEnd ? totalCount - count : count
    return s.split(subString, nthIndex).join(subString).length
}

const conditionsToFilters = (conditions: CustomizationFiltersCondition[]) => {
    const filters: Filters = {}
    conditions.forEach(condition => {
        const { sectionId, fieldId, operator, value } = condition
        filters[`${sectionId}__${fieldId}`] = { [operator]: value }
    })
    return filters
}

/*

Generate query used for filtering

TODO: currently lots of search-and-replace for strings going on which 
could be avoided by making template query definitions JS/TS objects that 
define how to accept filters and series themselves.

*/
export const getFiltersQuery = ({
    block,
    chartFilters,
    currentYear,
    pageContext
}: {
    block: BlockDefinition
    chartFilters: CustomizationDefinition
    currentYear: number
    pageContext: PageContextValue
}) => {
    const { options = {}, filters, facet } = chartFilters
    const { enableYearSelect, mode } = options
    const query = getBlockQuery({
        block,
        pageContext,
        queryOptions: {
            addArgumentsPlaceholder: true,
            addBucketFacetsPlaceholder: true
        }
    })
    // fragment starts after fourth "{"
    const fragmentStartIndex = getNthPosition(query, '{', 5) + 1
    // fragment ends before fourth "}" when counting from the end
    const fragmentEndIndex = getNthPosition(query, '}', 5, true) + 1
    const queryHeader = query.slice(0, fragmentStartIndex)
    const queryFragment = query.slice(fragmentStartIndex, fragmentEndIndex)
    let queryBody = queryFragment

    const seriesNames: string[] = []

    const queryFooter = query.slice(fragmentEndIndex)

    if (filters && (mode === MODE_GRID || mode === MODE_COMBINED)) {
        queryBody = filters
            .map((singleSeries, seriesIndex) => {
                let seriesFragment = queryFragment

                // {gender: {eq: male}, company_size: {eq: range_1}}
                // const filtersObject: FiltersObject = {}
                // singleSeries.conditions.forEach(condition => {
                //     const { fieldId, operator, value } = condition
                //     // transform e.g. es-ES into es_ES
                //     const cleanValue: FilterValue = Array.isArray(value)
                //         ? value.map(cleanUpValue)
                //         : cleanUpValue(value)
                //     filtersObject[fieldId] = { [operator]: cleanValue }
                // })

                const seriesName = `${block.id}_${seriesIndex + 1}`
                seriesNames.push(seriesName)

                const alreadyHasAlias = seriesFragment.includes(':')
                if (alreadyHasAlias) {
                    seriesFragment = seriesFragment.replace(block.id, `${seriesName}`)
                } else {
                    seriesFragment = seriesFragment.replace(block.id, `${seriesName}: ${block.id}`)
                }

                const queryArgs = getQueryArgsString({
                    filters: conditionsToFilters(singleSeries.conditions),
                    parameters: block.parameters
                })

                seriesFragment = seriesFragment.replace(argumentsPlaceholder, queryArgs || '')

                if (enableYearSelect && singleSeries.year) {
                    seriesFragment = seriesFragment.replace(
                        `year: ${currentYear}`,
                        `year: ${singleSeries.year}`
                    )
                }
                return seriesFragment
            })
            .join('')
    } else if (facet && mode === MODE_FACET) {
        const queryArgs = getQueryArgsString({
            facet,
            parameters: block.parameters
        })

        const seriesName = `${block.id}_by_${facet.id}`
        seriesNames.push(seriesName)

        const alreadyHasAlias = queryBody.includes(':')
        if (alreadyHasAlias) {
            queryBody = queryBody.replace(block.id, `${seriesName}`)
        } else {
            queryBody = queryBody.replace(block.id, `${seriesName}: ${block.id}`)
        }
        queryBody = queryBody.replace(argumentsPlaceholder, queryArgs || '')

        queryBody = queryBody.replace(bucketFacetsPlaceholder, getFacetFragment() || '')

        // if (block?.variables?.fixedIds) {
        //     /*

        //     Because facets are obtained in a "reversed" structure from the API, in some cases
        //     (e.g. countries) we need to fix the ids to ensure each facet contains the same items.

        //     TODO: return proper structure from API and delete this step

        //     */
        //     const fixedIdsFilter = `{ ids: { in: [${block?.variables?.fixedIds
        //         .map(id => `"${id}"`)
        //         .join()}] } }`
        //     queryBody = queryBody.replace('filters: {}', `filters: ${fixedIdsFilter}`)
        // }
    }
    queryBody = queryBody.replace(argumentsPlaceholder, '')
    queryBody = queryBody?.replaceAll(bucketFacetsPlaceholder, '')

    const newQuery = queryHeader + queryBody + queryFooter

    return { query: newQuery, seriesNames }
}

const baseUnits = Object.values(BucketUnits)

/*

Take multiple buckets arrays and merge them into a array with
multiple series (e.g. { count, count_1, percentageQuestion, percentageQuestion_1, etc. })

*/
type CombineBucketsOptions = {
    allBuckets: Bucket[][]
}
export const combineBuckets = ({ allBuckets }: CombineBucketsOptions) => {
    const [defaultBuckets, ...otherBucketsArray] = allBuckets as CombinedBucket[][]
    const mergedBuckets = cloneDeep(defaultBuckets)
    otherBucketsArray.forEach((otherBuckets: Bucket[], index: number) => {
        // default series is series 0, first custom series is series 1, etc.
        const seriesIndex = index + 1
        // TODO: add this later
        // const bucketsWithNoAnswerBucket = addNoAnswerBucket({ buckets, completion })
        mergedBuckets.forEach(bucket => {
            const { id } = bucket
            const otherSeriesBucket = otherBuckets.find(b => b.id === id)
            if (otherSeriesBucket) {
                baseUnits.forEach(unit => {
                    const unitName = `${unit}__${seriesIndex}` as `${BucketUnits}__${number}`
                    const value = otherSeriesBucket[unit]
                    if (typeof value !== 'undefined') {
                        bucket[unitName] = value
                    }
                })
            } else {
                // series might have returned undefined;
                // or else default buckets contains bucket items not in series buckets
                baseUnits.forEach(field => {
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

NOTE: this could be avoided by inverting the API query itself

*/
export const invertFacets = ({ facets, defaultBuckets }) => {
    const newBuckets = cloneDeep(defaultBuckets)
    facets.forEach(facet => {
        facet.buckets.forEach(facetBucket => {
            const baseBucket = newBuckets.find(b => b.id === facetBucket.id)
            if (!baseBucket) {
                console.warn(
                    `Could not find bucket id ${facetBucket.id} while processing facet id ${facet.id}`
                )
                console.warn(facetBucket)
                return
            }
            baseUnits.forEach(field => {
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

/*

Calculate facet averages

*/
export const calculateAverages = ({ buckets, facet, allFilters }) => {
    const facetOptions = allFilters[facet]
    if (facetOptions && typeof facetOptions[0].average !== 'undefined') {
        buckets.forEach(bucket => {
            if (bucket.id === 'no_answer') {
                bucket.average = 0
                return
            }
            const averageValue =
                sumBy(facetOptions, ({ id, average }) => {
                    const facetCount = bucket[`count__${id}`] || 0
                    return average * facetCount
                }) / bucket.count
            bucket.average = Math.round(averageValue)
        })
    }
    return buckets
}

// const getLabelPrefix = (template)=>{    switch (template) {
//     case 'feature'
//         return 'feature'
//     case 'user'
// }}

/*

Put demographics section first

*/
export const getOrderedSections = (sections: SectionMetadata[]) => {
    const demographicsSection = sections.find(s => s.id === 'user_info')
    const otherSections = sections.filter(s => s.id !== 'user_info')
    const orderedSections = demographicsSection
        ? [demographicsSection, ...otherSections]
        : otherSections
    return orderedSections
}
/*

*/
export const getSectionLabel = ({
    getString,
    section
}: {
    getString: StringTranslator
    section: SectionMetadata
}) => {
    return getString(`sections.${section.id === 'user_info' ? 'demographics' : section.id}.title`)
        ?.t
}
/*

Get label for field

*/
export const getFieldLabel = ({
    getString,
    field,
    entities
}: {
    getString: StringTranslator
    field: FilterItem
    entities: Entity[]
}) => {
    const { sectionId, template, id: id } = field
    const entity = entities.find(e => e.id === id)
    const entityName = entity && getEntityName(entity)
    if (entityName) {
        return entityName
    } else {
        let key
        if (template === 'happiness') {
            key = 'blocks.happiness'
        } else if (sectionId === 'other_tools') {
            key = `tools_others.${id}`
        } else if (template === 'feature') {
            key = `features.${id}`
        } else if (template === 'tool') {
            key = `tools.${id}`
        } else {
            key = `${sectionId}.${id}`
        }
        const s = getString(key)
        return s?.tClean || s?.t
    }
}

/*

Get label for operator

*/
export const getOperatorLabel = ({
    getString,
    operator
}: {
    getString: StringTranslator
    operator: OperatorEnum
}) => getString(`filters.operators.${operator}`, {}, operator)?.t

/*

Get label for a field value (age range, country name, source name, locale label, etc.)

*/
export const getValueLabel = ({
    getString,
    field,
    value,
    allFilters,
    entity,
    label
}: {
    getString: StringTranslator
    field: FilterItem
    value: FilterValue
    allFilters: FilterItem[]
    entity?: Entity
    label?: string
}) => {
    const { template } = field
    if (value === NO_ANSWER) {
        return getString('charts.no_answer').t
    } else if (label) {
        return label
    } else if (entity) {
        return getEntityName(entity)
    } else if (template === 'feature') {
        return getString(`options.features.${value}.label`)?.t
    } else if (template === 'tool') {
        return getString(`options.tools.${value}.short`)?.t
    } else {
        switch (field.id) {
            case 'source': {
                const source = allFilters
                    .find(q => q.id === 'source')
                    ?.options.find(s => s.id === value)
                return source?.entity?.name || value
            }
            case 'locale': {
                const locale = allFilters
                    .find(q => q.id === 'locale')
                    ?.options.find(l => l.id === value)
                const fallback = locale?.label
                return getString(`options.${field.id}.${value}`, {}, fallback)?.t
            }
            default: {
                const key = `options.${field.id}.${value}`
                const regular = getString(key, {}, value)?.t
                // const short = getString(`${key}.short`, {}, regular)?.t
                // note: using short descriptions here isn't clear enough
                return regular
            }
        }
    }
}

/*

Generate the legends used when filtering is enabled

*/
type FilterLegend = {
    color: string
    gradientColors: string[]
    id: string
    label: string
    shortLabel: string
}
export const useFilterLegends = ({
    chartFilters,
    block
}: {
    chartFilters: CustomizationDefinition
    block: BlockDefinition
}) => {
    const context = usePageContext()
    const { currentEdition } = context
    const { year: currentYear } = currentEdition

    const entities = useEntities()
    const allFilters = useAllFilters()

    const { options } = chartFilters
    const { showDefaultSeries, mode } = options

    const reverse = mode === MODE_FACET && block.blockType === 'VerticalBarBlock'

    const theme = useTheme()
    const { colors } = theme
    const { getString } = useI18n()
    let results: FilterLegend[]
    if (chartFilters.options.mode === MODE_GRID || chartFilters.options.mode === MODE_COMBINED) {
        if (!chartFilters.filters || chartFilters.filters.length === 0) {
            return []
        } else {
            const showYears =
                chartFilters.options.enableYearSelect &&
                chartFilters.filters.some(s => s.year && s.year !== currentYear)

            const defaultLabel = showYears
                ? getString('filters.series.year', { values: { year: currentYear } })?.t
                : getString('filters.legend.default')?.t
            const defaultLegendItem = {
                color: colors.barColorDefault.color,
                gradientColors: colors.barColorDefault.gradient,
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
                        seriesItem.conditions.map(({ fieldId, operator, value }) => {
                            const field = allFilters.find(f => f.id === fieldId) as FilterItem
                            const fieldLabel = getFieldLabel({ getString, field, entities })
                            const operatorLabel = getOperatorLabel({ getString, operator })
                            const valueArray = Array.isArray(value) ? value : [value]
                            const valueLabel = valueArray
                                .map(valueString =>
                                    getValueLabel({
                                        getString,
                                        field,
                                        value: valueString,
                                        allFilters,
                                        entity: entities.find(e => e.id === valueString)
                                    })
                                )
                                .join(', ')
                            return `<strong>${fieldLabel}</strong> ${operatorLabel} <strong>${valueLabel}</strong>`
                        })
                    ]
                }
                const label = labelSegments.join(', ')

                const barColorItem = getVariantBarColorItem(theme, seriesIndex)

                const legendItem = {
                    color: barColorItem.color,
                    gradientColors: barColorItem.gradient,
                    id: `series_${seriesIndex + 1}`,
                    label,
                    shortLabel: label
                }
                return legendItem
            })
            results = [...(showDefaultSeries ? [defaultLegendItem] : []), ...seriesLegendItems]
        }
    } else if (chartFilters.options.mode === MODE_FACET && chartFilters.facet) {
        const facetField = allFilters.find(f => f.id === chartFilters?.facet?.id) as FilterItem
        results = facetField?.options?.map(({ id }, index) => {
            const label = getValueLabel({
                getString,
                field: facetField,
                value: id,
                allFilters
            })
            const barColorItem = getVariantBarColorItem(theme, index + 1, facetField)
            return {
                color: barColorItem.color,
                gradientColors: barColorItem.gradient,
                id: `series_${id}`,
                label,
                shortLabel: label
            }
        })
    } else {
        results = []
    }
    return reverse ? [...results].reverse() : results
}

/*

Initialize the chart customization filter state

*/
export const getInitFilters = (initOptions?: CustomizationOptions): CustomizationDefinition => ({
    options: {
        showDefaultSeries: true,
        enableYearSelect: false,
        mode: MODE_DEFAULT,
        queryOnLoad: false,
        ...initOptions
    },
    filters: []
})

/*

Hook to initialize chart filters

*/
export const useChartFilters = ({
    block,
    options
}: {
    block: BlockDefinition
    options: CustomizationOptions
}) => {
    let loadFiltersFromUrl = false,
        urlFilters = {} as CustomizationDefinition
    if (typeof location !== 'undefined') {
        const search = new URLSearchParams(location.search)
        const queryParams = Object.fromEntries(search.entries())
        urlFilters = queryParams.filters && JSON.parse(atob(queryParams.filters))
        loadFiltersFromUrl = urlFilters && block.id === queryParams.blockId
    }

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(
        loadFiltersFromUrl
            ? { ...urlFilters, options: { queryOnLoad: true } }
            : getInitFilters(options)
    )

    const filterLegends = useFilterLegends({
        chartFilters,
        block
    })
    return { chartFilters, setChartFilters, filterLegends }
}

/*

Persist state in localStorage

https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/

 */
export function useStickyState(defaultValue: any, key: string) {
    const [value, setValue] = useState(() => {
        const stickyValue = window.localStorage.getItem(key)
        return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
    })
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])
    return [value, setValue]
}

export const getFiltersLink = ({
    block,
    pageContext,
    filtersState
}: {
    block: BlockDefinition
    pageContext: PageContextValue
    filtersState: any
}) => {
    const encodedParams = btoa(JSON.stringify(filtersState))
    const params = { filters: encodedParams, blockId: block.id }
    const link = getBlockLink({ block, pageContext, params, useRedirect: false })
    return link
}

export type FetchSeriesDataOptions = {
    block: BlockDefinition
    pageContext: PageContextValue
    chartFilters: CustomizationDefinition
    year: number
}

export const fetchSeriesData = async ({
    block,
    pageContext,
    chartFilters,
    year
}: FetchSeriesDataOptions): Promise<DataSeries[]> => {
    const { query, seriesNames } = getFiltersQuery({
        block,
        pageContext,
        chartFilters,
        currentYear: year
    })

    const url = process.env.GATSBY_API_URL
    if (!url) {
        throw new Error('GATSBY_API_URL env variable is not set')
    }
    const result: QueryData<AllQuestionData> = await runQuery(url, query, `${block.id}FiltersQuery`)
    // console.log('// result')
    // console.log(result)

    const dataPath = getBlockDataPath({ block, pageContext, addRootNode: false })

    // apply dataPath to get block data for each series
    const seriesData = seriesNames.map((seriesName, seriesIndex) => {
        const data = get(result, dataPath.replace(block.id, seriesName)) as AllQuestionData
        return {
            data,
            name: seriesName,
            filters: chartFilters.filters[seriesIndex],
            facet: chartFilters.facet
        }
    })
    return seriesData
}
