import ceil from 'lodash/ceil.js'
import { useI18n } from 'core/i18n/i18nContext'
import { Units, Mode, isPercentage } from 'core/helpers/units'
import { ChartOptionDefinition } from '@types/data'
import { BlockMode, BlockUnits } from '@types/index'
import { DefaultTheme, useTheme } from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import round from 'lodash/round'
import { CHART_MODE_GRID, CHART_MODE_STACKED, CHART_MODE_GROUPED } from 'core/filters/constants'
import { ChartModes, FacetItem, FilterItem } from 'core/filters/types'
import { Bucket, BucketUnits } from '@devographics/types'
import { NO_ANSWER, OVERALL, INSUFFICIENT_DATA } from '@devographics/constants'
import pickBy from 'lodash/pickBy'

/*

Which facets should use a velocity color scale

*/
export const velocityFacets = ['yearly_salary', 'company_size', 'years_of_experience', 'age']

/*

Switch between absolute (chart always has same max value) and relative (chart adapts to data) modes

*/
const getMode = (units: Units, mode: Mode) => {
    if (units === BucketUnits.PERCENTAGE_SURVEY || units === BucketUnits.PERCENTAGE_BUCKET) {
        return 'absolute'
    } else {
        return 'relative'
    }
}

// get all of one type of unit for a buucket
// (count__1, count__2, etc. )
const getAllBucketUnits = (bucket: Bucket, unit: BucketUnits) => {
    const bucketWithAllOneUnits = pickBy(bucket, (value, key) => key.includes(unit))
    const values = Object.values(bucketWithAllOneUnits)
    return values as number[]
}

/*

Get chart's max value

*/

const getMaxValue = (units: BucketUnits, mode: Mode, buckets: Bucket[], total: number) => {
    if (units === BucketUnits.AVERAGE) {
        return Math.max(...buckets.map(b => b[BucketUnits.AVERAGE]))
    } else if (units === BucketUnits.MEDIAN) {
        return Math.max(...buckets.map(b => b[BucketUnits.MEDIAN]))
    } else if (isPercentage(units)) {
        if (units === BucketUnits.PERCENTAGE_BUCKET) {
            return 100
        } else {
            const allPercentages = buckets.map(b => getAllBucketUnits(b, units)).flat()
            const maxBucketPercentage = Math.max(...allPercentages)
            return ceil(maxBucketPercentage, -1)
        }

        // if (getMode(units, mode) === 'absolute') {
        //     return 100
        // } else {
        //     const maxBucketPercentage = Math.max(...buckets.map(b => b[units]))
        //     return ceil(maxBucketPercentage, -1)
        // }
    } else {
        if (getMode(units, mode) === 'absolute') {
            return ceil(total, -3)
        } else {
            const allCounts = buckets.map(b => getAllBucketUnits(b, units)).flat()
            const maxBucketCount = Math.max(...allCounts)
            const precision = `${maxBucketCount}`.length - 2
            return ceil(maxBucketCount, -precision)
        }
    }
}

/*

Get a color item and loop over the array if index is bigger than length

For example with 10 availabe colors: 

Variant 1 = barColor 1
Variant 2 = barColor 2
...
Variant 10 = barColor 10
Variant 11 = barColor 1 // start over

*/
export const getVariantBarColorItem = (
    theme: DefaultTheme,
    variantIndex: number,
    facet?: FacetItem
) => {
    const { velocityBarColors, barColors } = theme.colors
    if (facet && facet.optionsAreSequential) {
        const i = Math.min(variantIndex, velocityBarColors.length - 1)
        return velocityBarColors[i]
    } else {
        const numberOfVariantColors = barColors.length
        const barColorIndex = variantIndex % numberOfVariantColors
        return barColors[barColorIndex]
    }
}

/*

Get various parameters for bar chart

*/
export const useBarChart = ({
    buckets,
    total,
    mode,
    units,
    i18nNamespace,
    shouldTranslate
}: {
    buckets: Bucket[]
    total: number
    mode: BlockMode
    units: BlockUnits
    i18nNamespace: string
    shouldTranslate?: boolean
}) => {
    const { translate } = useI18n()

    const formatTick = () => {
        if (shouldTranslate !== true) {
            return (value: string | number) => `${value}`
        }

        // automatically pick from `options` using
        // the provided namespace.
        return (value: string | number) => translate(`options.${i18nNamespace}.${value}.short`)
    }

    const formatValue = isPercentage(units) ? (value: string | number) => `${value}%` : '>-.2s'

    const maxValue = getMaxValue(units, mode, buckets, total)

    const tickCount = 6

    const ticks = Array.from({ length: tickCount }, (x, i) =>
        Math.round((i * maxValue) / (tickCount - 1))
    )

    return { formatTick, formatValue, maxValue, tickCount, ticks }
}

const horizontalDefs = {
    x1: 0,
    y1: 1,
    x2: 1,
    y2: 1
}
export const HORIZONTAL = 'Horizontal'
export const VERTICAL = 'Vertical'

type UseColorDefsOptions = {
    orientation?: 'Vertical' | 'Horizontal'
}

/*

Generate list of all possible bar fills

*/
export type GradientColor = {
    offset: number
    color: string
}
export type GradientDefinition = {
    id: string
    type: 'linearGradient'
    mainColor?: string
    colors: GradientColor[]
    x1?: number
    y1?: number
    x2?: number
    y2?: number
}

export type GradientFunction = (
    colors: DefaultTheme['colors'],
    orientation: 'Horizontal' | 'Vertical'
) => GradientDefinition

export const naGradient: GradientFunction = (colors, orientation) => ({
    id: `Gradient${orientation}Na`,
    type: 'linearGradient',
    colors: [
        { offset: 0, color: 'rgba(255,255,255,0.6)' },
        { offset: 100, color: 'rgba(255,255,255,0.2)' }
    ],
    ...(orientation === HORIZONTAL ? horizontalDefs : {})
})

export const insufficientDataGradient: GradientFunction = (colors, orientation) => ({
    id: `Gradient${orientation}InsufficientData`,
    type: 'linearGradient',
    mainColor: 'rgba(255,255,255,0.3)',
    colors: [
        { offset: 0, color: 'rgba(255,255,255,0.3)' },
        { offset: 100, color: 'rgba(255,255,255,0.05)' }
    ],
    ...(orientation === HORIZONTAL ? horizontalDefs : {})
})

export const noAnswerGradient: GradientFunction = (colors, orientation) => ({
    id: `Gradient${orientation}NoAnswer`,
    type: 'linearGradient',
    mainColor: 'rgba(255,255,255,0.3)',
    colors: [
        { offset: 0, color: 'rgba(255,255,255,0.3)' },
        { offset: 100, color: 'rgba(255,255,255,0.05)' }
    ],
    ...(orientation === HORIZONTAL ? horizontalDefs : {})
})

export const overallGradient: GradientFunction = (colors, orientation) => ({
    id: `Gradient${orientation}Overall`,
    type: 'linearGradient',
    colors: [
        { offset: 0, color: colors.barColorOverall?.gradient[1] },
        { offset: 100, color: colors.barColorOverall?.gradient[0] }
    ],
    ...(orientation === HORIZONTAL ? horizontalDefs : {})
})

export const freeformAnswersGradient: GradientFunction = (colors, orientation) => ({
    id: `Gradient${orientation}Freeform`,
    type: 'linearGradient',
    colors: [
        { offset: 0, color: `${colors.barColorDefault.gradient[1]}70` },
        { offset: 100, color: `${colors.barColorDefault.gradient[0]}70` }
    ],
    ...(orientation === HORIZONTAL ? horizontalDefs : {})
})

export const defaultGradient: GradientFunction = (colors, orientation) => ({
    id: `Gradient${orientation}Default`,
    type: 'linearGradient',
    colors: [
        { offset: 0, color: colors.barColorDefault.gradient[1] },
        { offset: 100, color: colors.barColorDefault.gradient[0] }
    ],
    ...(orientation === HORIZONTAL ? horizontalDefs : {})
})

export const useColorDefs = (options: UseColorDefsOptions = {}): GradientDefinition[] => {
    const { orientation = VERTICAL } = options
    const theme = useTheme()
    const { colors } = theme
    const barColors = colors.barColors.map((barColor, i) => ({
        id: `Gradient${orientation}${i + 1}`,
        type: 'linearGradient',
        colors: [
            { offset: 0, color: barColor.gradient[1] },
            { offset: 100, color: barColor.gradient[0] }
        ],
        ...(orientation === HORIZONTAL ? horizontalDefs : {})
    }))

    const velocity = colors.velocityBarColors.map((barColor, i) => ({
        id: `Velocity${orientation}${i + 1}`,
        type: 'linearGradient',
        colors: [
            { offset: 0, color: barColor.gradient[1] },
            { offset: 100, color: barColor.gradient[0] }
        ],
        ...(orientation === HORIZONTAL ? horizontalDefs : {})
    }))

    return [
        ...barColors,
        ...velocity,
        defaultGradient(colors, orientation),
        freeformAnswersGradient(colors, orientation),
        noAnswerGradient(colors, orientation),
        insufficientDataGradient(colors, orientation),
        overallGradient(colors, orientation),
        naGradient(colors, orientation)
    ]
}

type UseColorFillsOptions = {
    orientation?: 'Vertical' | 'Horizontal'
    defaultColorIndex?: number
    keys?: string[]
    facet?: FacetItem
    gridIndex?: number
    chartDisplayMode: ChartModes
    showDefaultSeries?: boolean
}

/*

Generate list of fills used by current chart along with matching functions

chartKeys are e.g. 

['percentage_bucket__male', 'percentage_bucket__female', 'percentage_bucket__non_binary', etc. ]

*/
export const useColorFills = (options: UseColorFillsOptions) => {
    const theme = useTheme()
    const allFilters = useAllFilters()

    const {
        chartDisplayMode,
        orientation = VERTICAL,
        gridIndex = 0,
        keys: chartKeys = [],
        facet,
        showDefaultSeries
    } = options

    const numberOfVariantColors = theme.colors.barColors.length

    const naFill = {
        match: d => d.data.indexValue === 'na',
        id: `Gradient${orientation}Na`
    }

    const noAnswerFill = {
        match: d => d.data.indexValue === NO_ANSWER || d.data.id.includes('no_answer'),
        id: `Gradient${orientation}NoAnswer`
    }

    const insufficientDataFill = {
        match: d =>
            d.data.indexValue === INSUFFICIENT_DATA || d.data.id.includes(INSUFFICIENT_DATA),
        id: `Gradient${orientation}InsufficientData`
    }

    const overallFill = {
        match: d => d.key === 'averageByFacet.overall',
        id: `Gradient${orientation}Overall`
    }

    const freeformFill = {
        match: d => d.data.data.isFreeformData === true,
        id: `Gradient${orientation}Freeform`
    }

    switch (chartDisplayMode) {
        case CHART_MODE_GRID: {
            /* 
            
            Part of a grid of other charts, make all bars the same color based on grid index

            */
            const isDefault = gridIndex === 0 && showDefaultSeries
            const gridIndexOffset = showDefaultSeries ? 0 : 1
            const id = isDefault
                ? `Gradient${orientation}Default`
                : `Gradient${orientation}${gridIndex + gridIndexOffset}`
            return [noAnswerFill, overallFill, freeformFill, naFill, { match: '*', id }]
        }
        case CHART_MODE_STACKED: {
            /*

            This will match keys of the type count__male, count__female, etc.

            */
            const facetField = allFilters.find(f => f.id === facet?.id) as FilterItem

            const prefix =
                facetField.optionsAreSequential || facetField.optionsAreRange
                    ? 'Velocity'
                    : 'Gradient'

            const averageFill = {
                match: d => {
                    // key will follow "unit__facet.bucket" pattern, e.g. "percentage_bucket__range_1_5.range_less_than_1"
                    const [facetKey, bucketKey] = d.key.split('.')
                    return facetKey === 'average'
                },
                id: `Gradient${orientation}1`
            }

            const facetFills = chartKeys.map((keyName, i) => ({
                match: d => {
                    // key will follow "unit__facet.bucket" pattern, e.g. "percentage_bucket__range_1_5.range_less_than_1"
                    const [facetKey, bucketKey] = d.key.split('.')
                    return facetKey === keyName
                },
                id: `${prefix}${orientation}${(i % numberOfVariantColors) + 2}`
            }))

            return [
                noAnswerFill,
                insufficientDataFill,
                overallFill,
                freeformFill,
                naFill,
                averageFill,
                ...facetFills
            ]
        }
        case CHART_MODE_GROUPED: {
            /*

            This will match keys of the type count__1, count__2, etc.

            */
            const numberedSeriesFills = theme.colors.barColors.map((x, i) => ({
                match: d => {
                    return d.key.includes(`__${i + 1}`)
                },
                id: `Gradient${orientation}${i + 1}`
            }))
            return [
                noAnswerFill,
                insufficientDataFill,
                overallFill,
                freeformFill,
                naFill,
                ...numberedSeriesFills
            ]
        }
        default: {
            /*

            This will match everything else for all the "normal" charts

            */
            const defaultFill = { match: '*', id: `Gradient${orientation}Default` }
            return [
                noAnswerFill,
                insufficientDataFill,
                overallFill,
                freeformFill,
                naFill,
                defaultFill
            ]
        }
    }
}

/*

Get options keys ([{ id: 'range_work_for_free' }, { id: 'range_0_10' }, { id: 'range_10_30' }, ...]) for all chart types

*/
export const useAllChartsOptions = (): FilterItem[] => {
    const context = usePageContext()
    const { currentEdition } = context
    const keys = []
    for (const section of currentEdition.sections) {
        for (const question of section.questions) {
            if (question.options || question.groups) {
                // if question has groups, use them to override the options
                // TODO: do this in a cleaner way
                const question_ = question.groups
                    ? { ...question, options: question.groups }
                    : question
                keys.push({ sectionId: section.id, ...question_ })
            }
        }
    }
    return keys
}

/*

Get all available filters, while optionally filtering out the current question's id

*/
export const useAllFilters = (excludeFilterId?: string) => {
    const allFilters = useAllChartsOptions()
    return allFilters.filter(q => q.id !== excludeFilterId)
}

export const useAllChartsOptionsIdsOnly = () => {
    const options = {}
    const allOptions = useAllChartsOptions()
    for (const option in allOptions) {
        options[option] = allOptions[option].map(o => o.id)
    }
    return options
}

export const useChartOptions = (fieldId: string): ChartOptionDefinition[] => {
    const options = useAllChartsOptions()
    return options[fieldId]
}

export const useChartOptionsIdsOnly = (fieldId: string): string[] =>
    useChartOptions(fieldId).map(o => o.id)

/*

Get list of keys (units) used by current chart

When no facet is specified, key is e.g. [count]

When multiple series are displayed, keys are [count, count__2, count__3]

If "gender" facet is specified, keys are e.g. ['count__male', 'count__female', ...]

*/
export const useChartKeys = ({
    units,
    facet,
    seriesCount,
    showDefaultSeries = true,
    showInsufficientDataSegment = false
}: {
    units: BlockUnits
    facet?: FacetItem
    seriesCount?: number
    showDefaultSeries?: boolean
    showInsufficientDataSegment?: boolean
}) => {
    const allChartKeys = useAllChartsOptions()
    if (facet) {
        if (units === BucketUnits.AVERAGE) {
            return [BucketUnits.AVERAGE]
        } else if (units === BucketUnits.MEDIAN) {
            return [BucketUnits.MEDIAN]
        } else {
            const question = allChartKeys.find(q => q.id === facet.id)
            const options = question?.groups ?? question?.options ?? []
            const keys = [...options].map(option => `${units}__${option.id}`)
            if (showInsufficientDataSegment) {
                keys.push(`${BucketUnits.PERCENTAGE_BUCKET}__${INSUFFICIENT_DATA}`)
            }
            keys.push(`${units}__${NO_ANSWER}`)
            return keys
        }
    } else if (seriesCount) {
        if (showDefaultSeries) {
            return [...Array(seriesCount)].map((x, i) => (i === 0 ? units : `${units}__${i}`))
        } else {
            return [...Array(seriesCount)].map((x, i) => `${units}__${i + 1}`)
        }
    } else {
        return [units]
    }
}

/*

How to format chart labels

*/
const usdFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
})

const yenFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0
})

const isDollar = (facetId: string) => ['yearly_salary'].includes(facetId)

const isYen = (facetId: string) => ['current_total_annual_compensation'].includes(facetId)

export const useChartLabelFormatter = ({
    units,
    facet
}: {
    units: BucketUnits
    facet?: FacetItem
}) => {
    if (isPercentage(units)) {
        return (value: number) => `${round(value, 1)}%`
    } else if (
        facet &&
        [BucketUnits.AVERAGE, BucketUnits.MEDIAN, BucketUnits.PERCENTILES].includes(units)
    ) {
        if (isDollar(facet.id)) {
            return (value: number) => usdFormatter.format(value)
        } else if (isYen(facet.id)) {
            return (value: number) => yenFormatter.format(value)
        }
    }
    return (value: number) => value
}
