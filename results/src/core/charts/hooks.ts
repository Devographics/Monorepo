import { useMemo } from 'react'
import ceil from 'lodash/ceil'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { Units, Mode, isPercentage } from 'core/helpers/units'
import { BucketItem } from 'core/types/data'
import { BlockMode, BlockUnits } from 'core/types'
import { useTheme } from 'styled-components'
import { usePageContext } from 'core/helpers/pageContext'
import isEmpty from 'lodash/isEmpty'

const getMode = (units: Units, mode: Mode) => {
    if (units === 'percentage_survey' || units === 'percentage_bucket') {
        return 'absolute'
    } else {
        return 'relative'
    }
}

const getMaxValue = (units: Units, mode: Mode, buckets: BucketItem[], total: number) => {
    if (isPercentage(units)) {
        if (getMode(units, mode) === 'absolute') {
            return 100
        } else {
            const maxBucketPercentage = Math.max(...buckets.map(b => b[units]))
            return ceil(maxBucketPercentage, -1)
        }
    } else {
        if (getMode(units, mode) === 'absolute') {
            return ceil(total, -3)
        } else {
            const maxBucketCount = Math.max(...buckets.map(b => b.count))
            const precision = `${maxBucketCount}`.length - 1
            return ceil(maxBucketCount, -precision)
        }
    }
}

export const useBarChart = ({
    buckets,
    total,
    mode,
    units,
    i18nNamespace,
    shouldTranslate
}: {
    buckets: BucketItem[]
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

    const ticks = Array.from({ length: tickCount }, (_, i) =>
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

type UseColorOptions = {
    orientation?: 'Vertical' | 'Horizontal'
    defaultColorIndex?: number
    keys?: string[]
}

export const useColorDefs = (options: UseColorOptions = {}) => {
    const { orientation = VERTICAL } = options
    const theme = useTheme()
    const colors = theme.colors.barColors.map((barColor, i) => ({
        id: `Gradient${orientation}${i + 1}`,
        type: 'linearGradient',
        colors: [
            { offset: 0, color: barColor.gradient[1] },
            { offset: 100, color: barColor.gradient[0] }
        ],
        ...(orientation === HORIZONTAL ? horizontalDefs : {})
    }))

    const noAnswerGradient = {
        id: `Gradient${orientation}NoAnswer`,
        type: 'linearGradient',
        colors: [
            { offset: 0, color: theme.colors.no_answer[1] },
            { offset: 100, color: theme.colors.no_answer[0] }
        ],
        ...(orientation === HORIZONTAL ? horizontalDefs : {})
    }
    return [...colors, noAnswerGradient]
}

export const useColorFills = (options: UseColorOptions = {}) => {
    const theme = useTheme()
    const { orientation = VERTICAL, defaultColorIndex = 1, keys } = options
    /*

    This will match keys of the type count__1, count__2, etc.
    as well as keys of the type count__male, count__female, etc.

    */
    const numberedFills = theme.colors.barColors.map((x, i) => ({
        match: d => {
            const seriesNumberMatch = d.key.includes(`__${i + 1}`)
            // key will follow unit__facet.bucket pattern, e.g. percentage_bucket__range_1_5.range_less_than_1
            const [facetKey, bucketKey] = d.key.split('.')
            const facetMatch = keys && facetKey === keys[i]
            return seriesNumberMatch || facetMatch
        },
        id: `Gradient${orientation}${i + 1}`
    }))

    const noAnswerFill = {
        match: d => d.data.indexValue === 'no_answer',
        id: `Gradient${orientation}NoAnswer`
    }

    /*

    Note: "defaultColorIndex" lets you force a specific bar color to use, 
    useful for small multiple views

    */
    const defaultFill = { match: '*', id: `Gradient${orientation}${defaultColorIndex}` }

    return [...numberedFills, noAnswerFill, defaultFill]
}

/*

Get keys (['range_work_for_free', 'range_0_10', 'range_10_30', ...]) for all chart types

*/
export const useAllChartsKeys = () => {
    const context = usePageContext()
    const { metadata } = context
    const { keys } = metadata
    return keys
}

/*

When no facet is specified, key is e.g. [count]

When multiple series are displayed, keys are [count, count__2, count__3]

If "gender" facet is specified, keys are e.g. ['count__male', 'count__female', ...]

*/
export const useChartKeys = ({
    units,
    facet,
    seriesCount
}: {
    units: BlockUnits
    facet?: string
    seriesCount?: number
}) => {
    const allChartKeys = useAllChartsKeys()
    if (facet) {
        return allChartKeys[facet].map(key => `${units}__${key}`)
    } else {
        return [...Array(seriesCount)].map((x, i) => (i === 0 ? units : `${units}__${i + 1}`))
    }
}
