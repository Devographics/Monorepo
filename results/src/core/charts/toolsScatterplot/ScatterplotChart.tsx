import React, { useRef } from 'react'
import { Nodes } from './Nodes'
import { ScatterplotChartState } from './chartState'
import { QuestionMetadata, SectionMetadata, StandardQuestionData } from '@devographics/types'
import { ScatterplotChartValues, useChartValues } from './chartValues'
import { useWidth } from 'core/charts/common2/helpers'
import { Axis, Gridlines as VGridlines } from 'core/charts/common2'
import AxisV from 'core/charts/common2/AxisV'
import './ScatterplotChart.scss'
import { Gridlines as HGridlines } from 'core/charts/verticalBar2/columns/Gridlines'
import { formatNumber, formatPercentage } from 'core/charts/common2/helpers/format'
import { Crosshair } from './Crosshair'
import { NodeData } from './types'
import { useTheme } from 'styled-components'
import { useToolSections } from 'core/helpers/metadata'

type ScatterplotChartProps = {
    chartState: ScatterplotChartState
    data: StandardQuestionData[]
}

const useNodes = ({
    data,
    chartState,
    chartValues
}: {
    data: StandardQuestionData[]
    chartState: ScatterplotChartState
    chartValues: ScatterplotChartValues
}) => {
    const { highlighted: currentCategory, currentItem } = chartState

    const toolSections = useToolSections()
    const theme = useTheme()
    const { xScale, yScale } = chartValues

    const nodes: NodeData[] = data.map((item, index) => {
        const { id, entity, responses } = item

        const isCurrentItem = currentItem === id
        const isHighlighted =
            currentCategory !== null &&
            toolSections
                ?.find((s: SectionMetadata) => s.id === currentCategory)
                .questions.find((q: QuestionMetadata) => q.id === id)

        const xValue = responses?.currentEdition?.buckets?.find(b => b.id === 'used')?.count || 0
        const yValue = responses?.currentEdition?.ratios?.['retention'] || 0

        const formattedX = formatNumber(xValue)
        const formattedY = formatPercentage(yValue * 100)

        const x = xScale(xValue)
        const y = yScale(yValue * 100)

        const category =
            toolSections.find(section => {
                return section.questions.find(q => q.id === id)
            }) || ({ id: 'no_category_found' } as SectionMetadata)
        const categoryId = category.id

        const color = theme.colors.ranges.toolSections[categoryId]

        const serieIndex = 0
        const serieId = 'dummy_serie_id'

        const nodeData: NodeData = {
            index,
            id,
            category,
            serieIndex,
            serieId,
            categoryId,
            label: entity.nameClean || entity.name,
            x,
            xValue,
            formattedX,
            y,
            yValue,
            formattedY,
            color,
            isCurrentItem,
            isHighlighted
        }
        return nodeData
    })
    return nodes
}
export const ScatterplotChart = ({ chartState, data }: ScatterplotChartProps) => {
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
