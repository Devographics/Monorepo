import React from 'react'
import Tooltip from 'core/components/Tooltip'
import { BasicPointData, VerticalBarViewDefinition } from '../types'
import { QuestionMetadata } from '@devographics/types'

const dotRadius = 6

export type DotComponentProps<SerieData, PointData extends BasicPointData, ChartStateType> = {
    lineLabel: string
    pointIndex: number
    value: number
    question: QuestionMetadata
    columnId: string
    getXCoord: (value: number) => number
    getYCoord: (value: number) => number
    chartState: ChartStateType
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export const Dot = <SerieData, PointData extends BasicPointData, ChartStateType>({
    lineLabel,
    pointIndex,
    value,
    viewDefinition,
    question,
    columnId,
    getXCoord,
    getYCoord,
    chartState
}: DotComponentProps<SerieData, PointData, ChartStateType>) => {
    const { formatValue } = viewDefinition
    const cx = getXCoord(pointIndex)
    const cy = getYCoord(value)
    return (
        <Tooltip
            trigger={
                <g className="chart-line-dot" transform-origin={`${cx} ${cy}`}>
                    <circle className="chart-line-dot-visible" cx={cx} cy={cy} r={dotRadius} />
                    <circle
                        className="chart-line-dot-invisible"
                        cx={cx}
                        cy={cy}
                        r={dotRadius * 3}
                    />
                    <text className="chart-line-label" x={cx} y={`${cy + 20}`}>
                        {formatValue(value, question, chartState)}
                    </text>
                </g>
            }
            contents={`${lineLabel}: ${formatValue(value, question, chartState)} (${columnId})`}
            asChild={true}
        />
    )
}
