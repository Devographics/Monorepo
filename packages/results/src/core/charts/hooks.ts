import { useMemo } from 'react'
import ceil from 'lodash/ceil'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { Units, Mode, isPercentage } from 'core/helpers/units'
import { BucketItem } from 'core/types/data'
import { BlockMode, BlockUnits } from 'core/types'

const getMode = (units: Units, mode: Mode) => {
    if (mode) {
        return mode
    } else {
        if (units === 'percentage_survey') {
            return 'absolute'
        } else {
            return 'relative'
        }
    }
}

const getMaxValue = (units: Units, mode: Mode, buckets: BucketItem[], total: number) => {
    if (isPercentage(units)) {
        if (getMode(units, mode) === 'absolute') {
            return 100
        } else {
            const maxBucketPercentage = Math.max(...buckets.map((b) => b[units]))
            return ceil(maxBucketPercentage, -1)
        }
    } else {
        if (getMode(units, mode) === 'absolute') {
            return ceil(total, -3)
        } else {
            const maxBucketCount = Math.max(...buckets.map((b) => b.count))
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
    shouldTranslate,
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
        Math.round((i * maxValue) / (tickCount-1))
    )

    return { formatTick, formatValue, maxValue, tickCount, ticks }
}
