import './Line.scss'
import React from 'react'
import { LinesComponentProps } from '../types'
import take from 'lodash/take'
import { useTheme } from 'styled-components'

const dotRadius = 8

export const Line = ({ chartState, chartValues, editions }: LinesComponentProps) => {
    const theme = useTheme()
    const { viewDefinition } = chartState
    const { getEditionValue } = viewDefinition
    const { totalColumns, maxValue } = chartValues
    if (!getEditionValue) {
        throw new Error(`getEditionValue not defined`)
    }

    const lineColor = theme.colors.barChart.primaryGradient[0]
    const style = {
        color: lineColor
    }

    const interval = 100 / totalColumns
    return (
        <div className="chart-columns-line-wrapper">
            <svg className="chart-columns-line" style={style}>
                {take(editions, editions.length - 1).map((edition, i) => (
                    <LineSegment
                        key={edition.editionId}
                        interval={interval}
                        editionIndex={i}
                        value1={getEditionValue(edition)}
                        value2={getEditionValue(editions[i + 1])}
                        maxValue={maxValue}
                    />
                ))}
                {editions.map((edition, i) => (
                    <Dot
                        key={edition.editionId}
                        interval={interval}
                        maxValue={maxValue}
                        editionIndex={i}
                        value={getEditionValue(edition)}
                    />
                ))}
            </svg>
        </div>
    )
}

const Dot = ({
    editionIndex,
    interval,
    maxValue,
    value
}: {
    editionIndex: number
    interval: number
    maxValue: number
    value: number
}) => {
    const cx = interval * editionIndex + interval / 2
    const cy = 100 - (value * 100) / maxValue
    return (
        <g>
            <circle cx={`${cx}%`} cy={`${cy}%`} r={dotRadius} />
            <text x={`${cx}%`} y={`${cy + 10}%`}>
                {value}
            </text>
        </g>
    )
}

const LineSegment = ({
    interval,
    editionIndex,
    value1,
    value2,
    maxValue
}: {
    interval: number
    editionIndex: number
    value1: number
    value2: number
    maxValue: number
}) => {
    const x1 = interval * editionIndex + interval / 2
    const x2 = interval * (editionIndex + 1) + interval / 2
    const y1 = 100 - (value1 * 100) / maxValue
    const y2 = 100 - (value2 * 100) / maxValue
    return <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} />
}
