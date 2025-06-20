import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react'
import cloneDeep from 'lodash/cloneDeep.js'
import {
    CustomizationDefinition,
    CustomizationOptions,
    FilterItem,
    CustomizationFiltersCondition,
    CustomizationFiltersSeries,
    FilterValue,
    OptionsOperatorEnum,
    DataSeries,
    NumericOperatorEnum
} from './types'
import { BlockVariantDefinition, StringTranslator } from 'core/types'
import {
    MODE_DEFAULT,
    MODE_FACET,
    MODE_GRID,
    MODE_COMBINED
    // START_MARKER,
    // END_MARKER
} from './constants'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import round from 'lodash/round'
import {
    useAllFilters,
    getVariantBarColorItem,
    HORIZONTAL,
    insufficientDataGradient,
    noAnswerGradient
} from 'core/charts/hooks'
import compact from 'lodash/compact'
import uniq from 'lodash/uniq'
import { usePageContext } from 'core/helpers/pageContext'
import { getBlockLink } from 'core/helpers/blockHelpers'
import { getEntityName, useEntities } from 'core/helpers/entities'
import { getBlockQuery } from 'core/queries/queries'
import { PageContextValue } from 'core/types/context'
import {
    Entity,
    Filters,
    SectionMetadata,
    BucketUnits,
    Bucket,
    OptionMetadata,
    CombinedBucketData,
    FacetBucket
} from '@devographics/types'
import { runQuery } from 'core/explorer/data'
// import { spacing, mq, fontSize } from 'core/theme'
import get from 'lodash/get'
import { getBlockDataPath } from 'core/helpers/data'
import { AllQuestionData } from '@devographics/types'
import { INSUFFICIENT_DATA, NO_ANSWER } from '@devographics/constants'
import pick from 'lodash/pick'
import { getItemLabel } from 'core/helpers/labels'
import merge from 'lodash/merge'
import { isFeatureTemplate, isToolTemplate } from '@devographics/helpers'

export const getNewCondition = ({
    filter,
    option: providedOption
}: {
    filter: FilterItem
    option?: OptionMetadata
}): CustomizationFiltersCondition => {
    let value
    const field = filter
    const { id: fieldId, sectionId, options, groups, optionsAreNumeric } = field
    const optionsOrGroups = groups ?? options

    if (!optionsOrGroups) {
        value = null
    } else {
        const option = providedOption || optionsOrGroups?.[0]
        value = option?.id
    }
    return {
        fieldId,
        sectionId,
        operator: OptionsOperatorEnum['EQ'],
        value
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
        const optionsOrGroups = firstConditionField?.groups ?? firstConditionField?.options

        if (!optionsOrGroups) {
            // if options are not provided (e.g. question is numeric)
            conditionOptions = { filter: firstConditionField }
        } else {
            const optionsInUse = getOptionsInUse({ filterId: firstCondition.fieldId, filtersState })
            // exclude any option currently in use
            const availableOptions = optionsOrGroups.filter(o => !optionsInUse.includes(o.id))
            // get first available option, unless no option is available
            // in which case just take first option from default list
            const option = availableOptions.length > 0 ? availableOptions[0] : optionsOrGroups[0]
            conditionOptions = { filter: firstConditionField, option }
        }
    }
    return {
        year,
        conditions: [getNewCondition(conditionOptions)]
    }
}

export const conditionsToFilters = (conditions: CustomizationFiltersCondition[]) => {
    const filters: Filters = {}
    conditions.forEach(condition => {
        const { sectionId, fieldId, operator, value } = condition
        filters[`${sectionId}__${fieldId}`] = { [operator]: value }
    })
    return filters
}

const baseUnits = Object.values(BucketUnits)

/*

Take multiple buckets arrays and merge them into a array with
multiple series (e.g. { count, count_1, percentageQuestion, percentageQuestion_1, etc. })

*/
type CombineBucketsOptions = {
    allSeriesBuckets: Bucket[][]
    showDefaultSeries?: boolean
}

// only keep properties that are common to the same buckets
// across all data series (id, entity, etc.)
const getBucketWithoutData = (bucket: Bucket): Bucket => {
    return pick(bucket, ['id', 'facetBuckets', 'entity'])
}

// prefix a bucket's data properties with a __1, __2, etc. suffix
// (count__1, percentageQuestion__1, etc.)
const getBucketDataWithSuffix = (bucket: Bucket, index: number, showDefaultSeries = true) => {
    const newBucket: CombinedBucketData = {}
    Object.keys(bucket).forEach(key => {
        const unit = key as BucketUnits
        if (Object.values(BucketUnits).includes(unit)) {
            const value = bucket[unit] as number
            let key
            if (showDefaultSeries) {
                key = index === 0 ? unit : `${unit}__${index}`
            } else {
                key = `${unit}__${index + 1}`
            }
            newBucket[key] = value
        }
    })
    return newBucket
}

export const combineBuckets = ({ allSeriesBuckets, showDefaultSeries }: CombineBucketsOptions) => {
    const mergedBuckets = allSeriesBuckets[0].map(bucket => getBucketWithoutData(bucket))
    allSeriesBuckets.forEach((seriesBuckets, i) => {
        seriesBuckets.forEach((bucket, j) => {
            const bucketDataWithSuffix = getBucketDataWithSuffix(bucket, i, showDefaultSeries)
            mergedBuckets[j] = { ...mergedBuckets[j], ...bucketDataWithSuffix }
        })
    })

    // const [defaultBuckets, ...otherBucketsArray] = allSeriesBuckets as CombinedBucket[][]
    // const mergedBuckets = cloneDeep(defaultBuckets)
    // otherBucketsArray.forEach((otherBuckets: Bucket[], index: number) => {
    //     // default series is series 0, first custom series is series 1, etc.
    //     const seriesIndex = index + 1
    //     // TODO: add this later
    //     // const bucketsWithNoAnswerBucket = addNoAnswerBucket({ buckets, completion })
    //     mergedBuckets.forEach(bucket => {
    //         const { id } = bucket
    //         const otherSeriesBucket = otherBuckets.find(b => b.id === id)
    //         if (otherSeriesBucket) {
    //             baseUnits.forEach(unit => {
    //                 const unitName = `${unit}__${seriesIndex}` as `${BucketUnits}__${number}`
    //                 const value = otherSeriesBucket[unit]
    //                 if (typeof value !== 'undefined') {
    //                     bucket[unitName] = value
    //                 }
    //             })
    //         } else {
    //             // series might have returned undefined;
    //             // or else default buckets contains bucket items not in series buckets
    //             baseUnits.forEach(field => {
    //                 bucket[`${field}__${seriesIndex}`] = 0
    //             })
    //         }
    //     })
    // })

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
    let label, key
    if (entityName) {
        label = entityName
    } else {
        if (isFeatureTemplate(template)) {
            key = `features.${id}`
        } else if (isToolTemplate(template)) {
            key = `tools.${id}`
        } else {
            key = `${sectionId}.${id}`
        }
        const s = getString(key)
        label = s?.tClean || s?.t || id
    }
    return { label, key }
}

/*

Get label for operator

*/
export const getOperatorLabel = ({
    getString,
    operator
}: {
    getString: StringTranslator
    operator: OptionsOperatorEnum | NumericOperatorEnum
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
    label: providedLabel
}: {
    getString: StringTranslator
    field: FilterItem
    value: FilterValue
    allFilters: FilterItem[]
    entity?: Entity
    label?: string
}) => {
    const { template } = field
    let key, label
    if (value === NO_ANSWER) {
        key = 'charts.no_answer'
        label = getString(key).t
    } else if (providedLabel) {
        key = 'provided'
        label = providedLabel
    } else if (entity) {
        key = 'entity'
        label = getEntityName(entity)
    } else if (isFeatureTemplate(template)) {
        key = `options.experience.${value}`
        label = getString(key)?.t
    } else if (isToolTemplate(template)) {
        key = `options.experience.${value}.short`
        label = getString(key)?.t
    } else {
        switch (field.id) {
            case 'source': {
                const source = allFilters
                    ?.find(q => q.id === 'source')
                    ?.options.find(s => s.id === value)
                label = source?.entity?.name || value
                break
            }
            case 'locale': {
                const locale = allFilters
                    ?.find(q => q.id === 'locale')
                    ?.options.find(l => l.id === value)
                const fallback = locale?.label
                key = `options.${field.id}.${value}`
                label = getString(key, {}, fallback)?.t
                break
            }
            default: {
                key = `options.${field.id}.${value}`
                label = getString(key, {}, value)?.t
                // const short = getString(`${key}.short`, {}, regular)?.t
                // note: using short descriptions here isn't clear enough
                break
            }
        }
    }
    return { key, label }
}

/*

Generate the legends used when filtering is enabled

*/
export type FilterLegend = {
    color: string
    gradientColors: string[]
    id: string
    label: string
    shortLabel: string
}

export const useFilterLegends = ({
    chartFilters,
    block,
    buckets
}: {
    chartFilters: CustomizationDefinition
    block: BlockVariantDefinition
    buckets: Bucket[]
}) => {
    const context = usePageContext()

    const { currentEdition, i18nNamespaces } = context
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
                            const { label: fieldLabel } = getFieldLabel({
                                getString,
                                field,
                                entities
                            })
                            const operatorLabel = getOperatorLabel({ getString, operator })
                            const valueArray = Array.isArray(value) ? value : [value]
                            const valueLabel = valueArray
                                .map(valueString => {
                                    const { key, label } = getItemLabel({
                                        id: valueString,
                                        getString,
                                        entity: entities.find(e => e.id === valueString),
                                        i18nNamespace: i18nNamespaces[field.id] || field.id
                                    })
                                    return label
                                })
                                .join(', ')
                            return `<strong>${fieldLabel}</strong> <span class="operator">${operatorLabel}</span> <strong>${valueLabel}</strong>`
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
            results = showDefaultSeries
                ? [defaultLegendItem, ...seriesLegendItems]
                : seriesLegendItems
        }
    } else if (chartFilters.options.mode === MODE_FACET && chartFilters.axis2) {
        const facetField = allFilters.find(f => f.id === chartFilters?.axis2?.id) as FilterItem

        // clone array to avoid modifying original one when adding elements to validOptions
        let validOptions = facetField?.options ? [...facetField.options] : []

        const allFacetBucketIds = getAllFacetBucketIds(buckets)
        // unless options are sequential and all of them need to be included,
        // filter out options that don't appear in the data either as buckets or facetBuckets,
        // or whose count is 0
        if (!facetField.optionsAreSequential) {
            validOptions = validOptions.filter(option =>
                allFacetBucketIds.includes(option.id.toString())
            )
        }

        if (buckets?.some(b => b.facetBuckets?.some(fb => fb.hasInsufficientData))) {
            validOptions = [...validOptions, { id: INSUFFICIENT_DATA }]
        }
        if (allFacetBucketIds.includes(NO_ANSWER)) {
            validOptions = [...validOptions, { id: NO_ANSWER }]
        }

        results = validOptions.map(({ id }, index) => {
            const { key, label } = getItemLabel({
                id,
                getString,
                entity: entities.find(e => e.id === id),
                i18nNamespace: i18nNamespaces[facetField.id] || facetField.id
            })
            let barColorItem
            if (id === NO_ANSWER) {
                const { mainColor, colors: gradientColors } = noAnswerGradient(colors, HORIZONTAL)
                barColorItem = { gradientColors, color: mainColor }
            } else if (id === INSUFFICIENT_DATA) {
                const { mainColor, colors: gradientColors } = insufficientDataGradient(
                    colors,
                    HORIZONTAL
                )
                barColorItem = { gradientColors, color: mainColor }
            } else {
                barColorItem = getVariantBarColorItem(theme, index + 1, facetField)
            }
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
export const getInitFilters = ({
    block,
    initOptions
}: {
    block: BlockVariantDefinition
    initOptions?: CustomizationOptions
}): CustomizationDefinition => {
    const { parameters = {} } = block
    const { cutoff, cutoffPercent, limit } = parameters

    let cutoffObject
    if (cutoff !== undefined) {
        cutoffObject = { cutoff, cutoffType: 'count' }
    } else if (cutoffPercent !== undefined) {
        cutoffObject = { cutoff: cutoffPercent, cutoffType: 'percent' }
    } else {
        cutoffObject = { cutoff: 1, cutoffType: 'percent' }
    }
    const options = {
        showDefaultSeries: false,
        enableYearSelect: false,
        mode: MODE_DEFAULT,
        queryOnLoad: false,
        ...cutoffObject,
        limit: limit ?? 20,
        mergeOtherBuckets: false,
        ...initOptions
    }
    return {
        options,
        axis1: {
            sectionId: block.queryOptions?.sectionId || block.sectionId,
            id: block.fieldId || block.id
        },
        filters: []
    }
}

/*

Hook to initialize chart filters

not used anymore?

*/
export const useChartFilters = ({
    block,
    options,
    providedFiltersState,
    buckets
}: {
    block: BlockVariantDefinition
    options: CustomizationOptions
    providedFiltersState?: CustomizationDefinition
    buckets: Bucket[]
}) => {
    let loadFiltersFromUrl = false,
        urlFilters = {} as CustomizationDefinition
    if (typeof location !== 'undefined') {
        const search = new URLSearchParams(location.search)
        const queryParams = Object.fromEntries(search.entries())
        urlFilters = queryParams.filters && JSON.parse(atob(queryParams.filters))
        loadFiltersFromUrl = urlFilters && block.id === queryParams.blockId
    }

    const initFilters = getInitFilters({ block, initOptions: options })
    const initFiltersState = loadFiltersFromUrl
        ? merge({}, initFilters, urlFilters, { options: { queryOnLoad: true } })
        : merge({}, initFilters, providedFiltersState)

    // contains the filters that define the series
    const [chartFilters, setChartFilters] = useState(initFiltersState)

    const filterLegends = useFilterLegends({
        chartFilters: initFiltersState,
        block,
        buckets
    })
    return { chartFilters, setChartFilters, filterLegends }
}

/*

Persist state in localStorage

https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/

 */
export function useStickyState<T>(defaultValue: any, key: string) {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return defaultValue
        } else {
            const stickyValue = window.localStorage.getItem(key)
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue
        }
    })
    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])
    return [value, setValue] as [T, Dispatch<SetStateAction<T>>]
}

export const getFiltersLink = ({
    block,
    pageContext,
    filtersState
}: {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    filtersState: any
}) => {
    const encodedParams = btoa(JSON.stringify(filtersState))
    const params = { filters: encodedParams, blockId: block.id }
    const link = getBlockLink({ block, pageContext, params, useRedirect: false })
    return link
}

export type FetchSeriesDataOptions = {
    block: BlockVariantDefinition
    pageContext: PageContextValue
    chartFilters: CustomizationDefinition
    year: number
}

export type FetchSeriesDataPayload = {
    result?: Array<DataSeries<AllQuestionData>>
    error?: any
    query: string
    seriesNames: string[]
}

export async function fetchSeriesData({
    block,
    pageContext,
    chartFilters,
    year
}: FetchSeriesDataOptions): Promise<FetchSeriesDataPayload> {
    const { currentEdition, currentSurvey, id: pageId } = pageContext

    const { query, seriesNames } = getBlockQuery({
        block,
        survey: currentSurvey,
        edition: currentEdition,
        section: { id: pageId },
        chartFilters
    })

    const url = process.env.GATSBY_API_URL
    if (!url) {
        throw new Error('GATSBY_API_URL env variable is not set')
    }
    const { result, error } = await runQuery<AllQuestionData>(url, query, `${block.id}FiltersQuery`)

    if (error) {
        return { error, query, seriesNames }
    } else {
        const dataPath = getBlockDataPath({ chartFilters, block, pageContext, addRootNode: false })

        // apply dataPath to get block data for each series
        const seriesData = seriesNames.map((seriesName, seriesIndex) => {
            const id = chartFilters?.axis1?.id || block.id
            const dataPath2 = dataPath.replace(id, seriesName)
            const data = get(result, dataPath2) as AllQuestionData

            return {
                data,
                name: seriesName,
                filters: chartFilters.filters[seriesIndex],
                facet: chartFilters.axis2
            }
        })
        const returnObject = { result: seriesData, query, seriesNames }
        return returnObject
    }
}

export type CustomVariant = {
    id: string
    blockId: string
    chartFilters: CustomizationDefinition
    name?: string
}

export type CreateVariantOptions = {
    name?: string
    chartFilters: CustomizationDefinition
}
export type UpdateVariantOptions = {
    name?: string
    chartFilters?: CustomizationDefinition
}

export type GetVariantType = (id: CustomVariant['id']) => CustomVariant | undefined
export type DeleteVariantType = (id: CustomVariant['id']) => void
export type CreateVariantType = (
    options: CreateVariantOptions & { blockId: string }
) => CustomVariant
export type UpdateVariantType = (id: CustomVariant['id'], options: UpdateVariantOptions) => void

export const useCustomVariants = () => {
    const [customVariants, setCustomVariants] = useStickyState<CustomVariant[]>(
        [],
        'customVariants'
    )
    // TODO: also handle any variants defined by URL parameters

    // get specific variant
    const getVariant: GetVariantType = id => {
        const variant = customVariants.find(v => v.id === id)
        return variant
    }

    // delete specific variant
    const deleteVariant: DeleteVariantType = id => {
        setCustomVariants(variants => {
            return variants.filter(v => v.id !== id)
        })
    }

    // create new variant for a specific block
    const createVariant: CreateVariantType = options => {
        const { name, blockId, chartFilters } = options
        const id = new Date().getTime().toString()
        const newVariant: CustomVariant = { id, blockId, chartFilters }
        if (name) {
            newVariant.name = name
        }
        setCustomVariants(variants => {
            return [...variants, newVariant]
        })
        return newVariant
    }

    // modify an existing variant
    const updateVariant: UpdateVariantType = (id, options) => {
        const variantIndex = customVariants.findIndex(v => v.id === id)
        const updatedVariant = { ...customVariants[variantIndex], ...options }
        customVariants[variantIndex] = updatedVariant

        setCustomVariants(variants => {
            const variantIndex = variants.findIndex(v => v.id === id)
            const updatedVariant = { ...variants[variantIndex], ...options }
            const newVariants = [...variants]
            newVariants[variantIndex] = updatedVariant
            return newVariants
        })
    }

    return {
        customVariants,
        setCustomVariants,
        getVariant,
        deleteVariant,
        createVariant,
        updateVariant
    }
}

// see https://stackoverflow.com/a/57941438
export const useDidMountEffect = (func: () => void, deps: Array<any>) => {
    const didMount = useRef(false)

    useEffect(() => {
        if (didMount.current) {
            func()
        } else {
            didMount.current = true
        }
    }, deps)
}
