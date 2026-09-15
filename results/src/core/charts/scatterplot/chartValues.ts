import { FeaturesOptions, StandardQuestionData } from '@devographics/types'
import { ScatterplotChartState } from './chartState'
import { Tick } from 'core/charts/common2/types'
import { useTicks, useXScale } from 'core/charts/horizontalBar2/views/boxplot/helpers'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { useMemo } from 'react'
import { NodeData } from './types'
import maxBy from 'lodash/maxBy.js'
import minBy from 'lodash/minBy.js'

export type ScatterplotChartValues = {
    maxXValue: number
    maxYValue: number
    xTicks: Tick[]
    yTicks: Tick[]
    xScale: ScaleLinear
    yScale: ScaleLinear
}
export const useChartValues = ({
    chartState,
    nodes,
    contentWidth,
    contentHeight
}: {
    chartState: ScatterplotChartState
    nodes: NodeData[]
    contentWidth: number
    contentHeight: number
}) => {
    const minXValue = minBy(nodes, n => n.xValue)?.xValue || 0
    const maxXValue = maxBy(nodes, n => n.xValue)?.xValue || 0
    const minYValue = minBy(nodes, n => n.yValue)?.yValue || 0
    const maxYValue = maxBy(nodes, n => n.yValue)?.yValue || 0

    // artificially increase the top limit of the chart to avoid having
    // the highest point be right on the edge of the chart
    const multiplier = 1.05
    const reverseMultiplier = 0.95
    const xIsPercentage = false
    const yIsPercentage = false
    const xMinBound = xIsPercentage ? 0 : minXValue * reverseMultiplier
    const xMaxBound = xIsPercentage ? 100 : maxXValue * multiplier
    const yMinBound = yIsPercentage ? 0 : minYValue * reverseMultiplier
    const yMaxBound = yIsPercentage ? 100 : maxYValue * multiplier

    const xScale = useXScale({ chartMin: xMinBound, chartMax: xMaxBound, contentWidth })
    const yScale = scaleLinear<number, number>()
        .domain([yMinBound, yMaxBound])
        .range([contentHeight, 0])

    const xTicks: Tick[] = useMemo(() => useTicks(xScale), [xScale])
    const yTicks = yScale.ticks(10).map(value => ({
        value
    }))

    const chartValues: ScatterplotChartValues = {
        xScale,
        yScale,
        maxXValue,
        maxYValue,
        xTicks,
        yTicks
    }
    return chartValues
}
