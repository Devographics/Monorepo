import { useMemo } from 'react'
import ceil from 'lodash/ceil'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { Units, Mode, isPercentage } from 'core/helpers/units'
import { BucketItem } from 'core/types/data'
import { BlockMode, BlockUnits } from 'core/types'
import { useTheme } from 'styled-components'

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

export const useColorDefs = ({ orientation = VERTICAL }) => {
    const theme = useTheme()
    const colors = theme.colors.barColors.map((barColor, i) => ({
        id: `Gradient${orientation}${i}`,
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

// support up to 5 fills
const fillNumber = 5

export const useColorFills = ({ orientation = VERTICAL, defaultColorIndex = 1, keys }) => {
    /*

    This will match keys of the type count__1, count__2, etc.

    */
    const numberedFills = [...Array(fillNumber)].map((x, i) => ({
        match: d => {
            return d.key.includes(`__${i}`)
        },
        id: `Gradient${orientation}${i}`
    }))
    /*

    This will match keys of the type count__male, count__female, etc.

    */
    const keyedFills = keys.map((key, i) => ({
        match: d => {
            return d.key.includes(key)
        },
        id: `Gradient${orientation}${i}`
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

    return [...numberedFills, ...keyedFills, noAnswerFill, defaultFill]
}
