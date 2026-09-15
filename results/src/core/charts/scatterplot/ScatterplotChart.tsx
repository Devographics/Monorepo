import React, { useRef } from 'react'
import { Nodes } from './Nodes'
import { ScatterplotChartState } from '../scatterplot/chartState'
import { StandardQuestionData } from '@devographics/types'
import { useChartValues } from '../scatterplot/chartValues'
import { useWidth } from 'core/charts/common2/helpers'
import { Axis, Gridlines as VGridlines } from 'core/charts/common2'
import AxisV from 'core/charts/common2/AxisV'
import './ScatterplotChart.scss'
import { Gridlines as HGridlines } from 'core/charts/verticalBar2/columns/Gridlines'
import { formatNumber, formatPercentage } from 'core/charts/common2/helpers/format'
import { Crosshair } from './Crosshair'
import { GetNodeProps } from '../toolsScatterplot/ToolsScatterplotBlock'
import { NodeData } from './types'

type ScatterplotChartProps = {
    chartState: ScatterplotChartState
    data: StandardQuestionData[]
    useNodes: (props: GetNodeProps) => NodeData[]
}

export const ScatterplotChart = ({ chartState, data, useNodes }: ScatterplotChartProps) => {
    // note: we need a placeholder that's part of the grid/subgrid layout
    // to be able to calculate the content width
    const contentRef = useRef<HTMLDivElement>(null)
    const contentWidth = useWidth(contentRef) || 0
    const contentHeight = 400

    const chartValues = useChartValues({ chartState, data, contentWidth, contentHeight })

    const { xTicks, yTicks } = chartValues

    const axisProps = { chartState }

    const nodes = useNodes({ data, chartState, chartValues })

    return (
        <div className="scatterplot-chart">
            <Axis
                variant="top"
                {...axisProps}
                formatValue={formatNumber}
                ticks={xTicks}
                labelId="charts.axis_legends.users_count"
            />
            <AxisV
                variant="left"
                {...axisProps}
                formatValue={formatPercentage}
                ticks={yTicks}
                labelId="charts.axis_legends.satisfaction_percentage"
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
                    <Nodes chartState={chartState} chartValues={chartValues} nodes={nodes} />
                    <Crosshair
                        chartState={chartState}
                        chartValues={chartValues}
                        nodes={nodes}
                        innerHeight={contentHeight}
                    />
                </svg>
            </div>
            <Axis
                variant="bottom"
                {...axisProps}
                ticks={xTicks}
                formatValue={formatNumber}
                labelId="charts.axis_legends.users_count"
            />
            <AxisV
                variant="right"
                {...axisProps}
                ticks={yTicks}
                formatValue={formatPercentage}
                labelId="charts.axis_legends.satisfaction_percentage"
            />
        </div>
    )
}

export default ScatterplotChart
