import React, { useRef } from 'react'
import { Nodes } from './Nodes'
import { ScatterplotChartState } from '../scatterplot/chartState'
import { QuestionMetadata, StandardQuestionData } from '@devographics/types'
import { useWidth } from 'core/charts/common2/helpers'
import { Axis, Gridlines as VGridlines } from 'core/charts/common2'
import AxisV from 'core/charts/common2/AxisV'
import './ScatterplotChart.scss'
import { Gridlines as HGridlines } from 'core/charts/verticalBar2/columns/Gridlines'
import { formatNumber, formatPercentage } from 'core/charts/common2/helpers/format'
import { Crosshair } from './Crosshair'
import { NodeData } from './types'
import { BlockVariantDefinition } from 'core/types'
import { useChartValues } from './chartValues'

export type GetNodeProps = {
    data: StandardQuestionData[]
    question: QuestionMetadata
    chartState: ScatterplotChartState
    block: BlockVariantDefinition
    axis1Formatter: (v: number) => string
    axis2Formatter: (v: number) => string
}

type ScatterplotChartProps = {
    block: BlockVariantDefinition
    question: QuestionMetadata
    chartState: ScatterplotChartState
    data: StandardQuestionData[]
    useNodes: (props: GetNodeProps) => NodeData[]
    axis1Formatter: (v: number) => string
    axis2Formatter: (v: number) => string
    axis1Label: string
    axis2Label: string
}

export const ScatterplotChart = ({
    block,
    question,
    chartState,
    data,
    useNodes,
    axis1Formatter,
    axis2Formatter,
    axis1Label,
    axis2Label
}: ScatterplotChartProps) => {
    // note: we need a placeholder that's part of the grid/subgrid layout
    // to be able to calculate the content width
    const contentRef = useRef<HTMLDivElement>(null)
    const contentWidth = useWidth(contentRef) || 0
    const contentHeight = 400

    const nodes = useNodes({ block, question, data, chartState, axis1Formatter, axis2Formatter })

    const chartValues = useChartValues({ chartState, nodes, contentWidth, contentHeight })

    const { xTicks, yTicks, xScale, yScale } = chartValues

    const axisProps = { chartState }

    const nodesWithPositions = nodes.map(node => {
        const { xValue, yValue } = node
        const x = xScale(xValue)
        const y = yScale(yValue)
        return { ...node, x, y }
    })

    return (
        <div className="scatterplot-chart">
            <Axis
                variant="top"
                {...axisProps}
                formatValue={axis1Formatter}
                ticks={xTicks}
                label={axis1Label}
            />
            <AxisV
                variant="left"
                {...axisProps}
                formatValue={axis2Formatter}
                ticks={yTicks}
                label={axis2Label}
            />
            <div className="scatterplot-chart-inner" ref={contentRef}>
                <VGridlines ticks={xTicks} />
                <HGridlines ticks={yTicks} />
                <svg className="scatterplot-chart-svg" height={contentHeight}>
                    {/* <Quadrants
                        chartState={chartState}
                        innerWidth={contentWidth}
                        innerHeight={contentHeight}
                        xScale={xScale}
                        yScale={yScale}
                    /> */}
                    {/* grid goes here */}
                    <Nodes
                        chartState={chartState}
                        chartValues={chartValues}
                        nodes={nodesWithPositions}
                    />
                    <Crosshair
                        chartState={chartState}
                        chartValues={chartValues}
                        nodes={nodesWithPositions}
                        innerHeight={contentHeight}
                    />
                </svg>
            </div>
            <Axis
                variant="bottom"
                {...axisProps}
                ticks={xTicks}
                formatValue={axis1Formatter}
                label={axis1Label}
            />
            <AxisV
                variant="right"
                {...axisProps}
                ticks={yTicks}
                formatValue={axis2Formatter}
                label={axis2Label}
            />
        </div>
    )
}

export default ScatterplotChart
