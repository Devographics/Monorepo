import React from 'react'
import take from 'lodash/take'
import { useTheme } from 'styled-components'
import { getEditionByYear } from '../helpers/other'
import Tooltip from 'core/components/Tooltip'
import { LineComponentProps } from '../types'

const dotRadius = 8

export const Line = ({ id, chartState, chartValues, editions, lineIndex }: LineComponentProps) => {
    const theme = useTheme()
    const { viewDefinition } = chartState
    const { getEditionValue } = viewDefinition
    const { totalColumns, maxValue, years } = chartValues
    if (!getEditionValue) {
        throw new Error(`getEditionValue not defined`)
    }

    const lineColor =
        typeof lineIndex === 'undefined'
            ? theme.colors.barChart.primaryGradient[0]
            : theme.colors.distinct[lineIndex]
    const style = {
        color: lineColor
    }

    const interval = 100 / totalColumns
    return (
        <g data-id={id} style={style}>
            {take(editions, editions.length - 1).map((edition, i) => {
                // line starts at the index for the current edition's year
                const startIndex = years.findIndex(year => year === edition.year)
                // line ends at the index for the next edition's year
                const nextEdition = editions[i + 1]
                const endIndex = years.findIndex(year => year === nextEdition.year)
                return (
                    <LineSegment
                        key={edition.editionId}
                        interval={interval}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        value1={getEditionValue(edition, chartState)}
                        value2={getEditionValue(editions[i + 1], chartState)}
                        maxValue={maxValue}
                    />
                )
            })}
            {years.map((year, i) => {
                const edition = getEditionByYear(year, editions)
                return edition ? (
                    <Dot
                        key={edition.editionId}
                        interval={interval}
                        maxValue={maxValue}
                        editionIndex={i}
                        value={getEditionValue(edition, chartState)}
                    />
                ) : null
            })}
        </g>
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
        <Tooltip
            trigger={
                <g className="chart-line-dot">
                    <circle cx={`${cx}%`} cy={`${cy}%`} r={dotRadius} />
                    <text x={`${cx}%`} y={`${cy + 10}%`}>
                        {value}
                    </text>
                </g>
            }
            contents={'label'}
            asChild={true}
        />
    )
}

const LineSegment = ({
    interval,
    startIndex,
    endIndex,
    value1,
    value2,
    maxValue
}: {
    interval: number
    startIndex: number
    endIndex: number
    value1: number
    value2: number
    maxValue: number
}) => {
    const x1 = interval * startIndex + interval / 2
    const x2 = interval * endIndex + interval / 2
    const y1 = 100 - (value1 * 100) / maxValue
    const y2 = 100 - (value2 * 100) / maxValue
    return <line x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} />
}
