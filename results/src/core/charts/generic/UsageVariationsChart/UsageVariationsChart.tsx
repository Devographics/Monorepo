import React, { useCallback } from 'react'
import { useTheme } from 'styled-components'
import { Margin } from '@nivo/core'
import { TickFormatter } from '@nivo/axes'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { ResponsiveMultipleDivergingLines } from './multiple-diverging-lines'

interface UsageVariationsChartProps {
    data: {
        id: string
        name: string
        baseline: number
        data: {
            index: string
            count: number
            percentage: number
            percentageDelta: number
        }[]
    }[]
    margin: Margin
    keys: string[]
    i18nNamespace: string
}

export const UsageVariationsChart = ({
    data,
    margin,
    keys,
    i18nNamespace,
}: UsageVariationsChartProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const translateTick = useCallback(
        (key: string) => translate(`options.${i18nNamespace}.${key}.short`) as string,
        [translate, i18nNamespace]
    ) as TickFormatter

    return (
        <ResponsiveMultipleDivergingLines
            data={data}
            keys={keys}
            i18nNamespace={i18nNamespace}
            theme={theme.charts}
            colors={theme.colors.distinct}
            margin={margin}
            animate={false}
            motionConfig="gentle"
            axisTop={{
                format: translateTick,
                legend: translate(`charts.axis_legends.${i18nNamespace}`),
                legendPosition: 'middle',
                legendOffset: -46,
            }}
        />
    )
}
