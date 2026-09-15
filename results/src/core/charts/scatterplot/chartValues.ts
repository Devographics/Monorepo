import { FeaturesOptions, StandardQuestionData } from '@devographics/types'
import { ScatterplotChartState } from './chartState'
import { Tick } from 'core/charts/common2/types'
import { useTicks, useXScale } from 'core/charts/horizontalBar2/views/boxplot/helpers'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { useMemo } from 'react'

export type ScatterplotChartValues = {
    maxOverallValue: number
    xTicks: Tick[]
    yTicks: Tick[]
    xScale: ScaleLinear
    yScale: ScaleLinear
}
export const useChartValues = ({
    chartState,
    data,
    contentWidth,
    contentHeight
}: {
    chartState: ScatterplotChartState
    data: StandardQuestionData[]
    contentWidth: number
    contentHeight: number
}) => {
    let maxOverallValue = 0
    for (const item of data) {
        const currentEdition = item.responses.currentEdition
        const usedBucketCount =
            currentEdition.buckets.find(b => b.id === FeaturesOptions.USED)?.count || 0
        if (usedBucketCount > maxOverallValue) {
            maxOverallValue = usedBucketCount
        }
    }

    // artificially increase the top limit of the chart to avoid having
    // the highest point be right on the edge of the chart
    const multiplier = 1.1
    const xScale = useXScale({ chartMax: maxOverallValue * multiplier, contentWidth })
    const yScale = scaleLinear<number, number>().domain([0, 100]).range([contentHeight, 0])

    const xTicks: Tick[] = useMemo(() => useTicks(xScale), [xScale])
    const yTicks = yScale.ticks(10).map(value => ({
        value
    }))

    const chartValues: ScatterplotChartValues = { xScale, yScale, maxOverallValue, xTicks, yTicks }
    return chartValues
}
