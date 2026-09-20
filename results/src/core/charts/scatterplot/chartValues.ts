import { FeaturesOptions, QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { ScatterplotChartState } from './chartState'
import { Tick } from 'core/charts/common2/types'
import { useTicks, useXScale } from 'core/charts/horizontalBar2/views/boxplot/helpers'
import { scaleLinear, ScaleLinear } from 'd3-scale'
import { useMemo } from 'react'
import { NodeData } from './types'
import maxBy from 'lodash/maxBy.js'
import minBy from 'lodash/minBy.js'
import { isPercentage } from '../common2/helpers/format'

export type ScatterplotChartValues = {
    xMinValue: number
    xMaxValue: number
    yMinValue: number
    yMaxValue: number
    xMinBound: number
    xMaxBound: number
    yMinBound: number
    yMaxBound: number
    xTicks: Tick[]
    yTicks: Tick[]
    xScale: ScaleLinear
    yScale: ScaleLinear
}
export const useChartValues = ({
    question,
    axis1,
    axis2,
    chartState,
    nodes,
    contentWidth,
    contentHeight
}: {
    question: QuestionMetadata
    axis1: QuestionMetadata
    axis2: QuestionMetadata
    chartState: ScatterplotChartState
    nodes: NodeData[]
    contentWidth: number
    contentHeight: number
}) => {
    let xMinBound: number, xMaxBound: number, yMinBound: number, yMaxBound: number

    // artificially increase the top limit of the chart to avoid having
    // the highest point be right on the edge of the chart
    const multiplier = 1.05
    const reverseMultiplier = 0.95

    const xMinValue = minBy(nodes, n => n.xValue)?.xValue || 0
    const xMaxValue = maxBy(nodes, n => n.xValue)?.xValue || 0

    if (axis1.optionsAreNumeric && axis1.options) {
        const minXOption = minBy(axis1.options, o => o.value || o.id)
        const maxXOption = maxBy(axis1.options, o => o.value || o.id)

        xMinBound = Number(minXOption?.value || minXOption?.id)
        xMaxBound = Number(maxXOption?.value || maxXOption?.id)
    } else if (isPercentage(axis1)) {
        xMinBound = 0
        xMaxBound = 100
    } else {
        xMinBound = xMinValue * reverseMultiplier
        xMaxBound = xMaxValue * multiplier
    }

    const yMinValue = minBy(nodes, n => n.yValue)?.yValue || 0
    const yMaxValue = maxBy(nodes, n => n.yValue)?.yValue || 0

    if (axis2.optionsAreNumeric && axis2.options) {
        const minYOption = minBy(axis2.options, o => o.value || o.id)
        const maxYOption = maxBy(axis2.options, o => o.value || o.id)

        yMinBound = Number(minYOption?.value || minYOption?.id)
        yMaxBound = Number(maxYOption?.value || maxYOption?.id)
    } else if (isPercentage(axis2)) {
        yMinBound = 0
        yMaxBound = 100
    } else {
        yMinBound = yMinValue * reverseMultiplier
        yMaxBound = yMaxValue * multiplier
    }

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
        xMinValue,
        xMaxValue,
        yMinValue,
        yMaxValue,
        xMinBound,
        xMaxBound,
        yMinBound,
        yMaxBound,
        xTicks,
        yTicks
    }
    return chartValues
}
