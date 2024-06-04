import React from 'react'
import take from 'lodash/take'
import { useTheme } from 'styled-components'
import { getEditionByYear } from '../helpers/other'
import Tooltip from 'core/components/Tooltip'
import { LineComponentProps } from '../types'
import { ViewDefinition } from 'core/charts/common2/types'
import { QuestionMetadata } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'

const dotRadius = 6

export const Line = ({
    id,
    entity,
    chartState,
    chartValues,
    editions,
    lineIndex,
    width,
    height
}: LineComponentProps) => {
    const { getString } = useI18n()

    const theme = useTheme()
    const { viewDefinition, highlighted } = chartState
    const { getEditionValue, formatValue, invertYAxis } = viewDefinition
    const { totalColumns, maxValue, years, question, legendItems = [] } = chartValues
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

    const { label: lineLabel } = getItemLabel({ id, entity, getString })

    const highlightIsActive = highlighted !== null
    const isHighlighted = highlighted === id
    const interval = width / totalColumns
    const totalItems = legendItems.length

    const getXCoord = (yearIndex: number) => interval * yearIndex + interval / 2
    const getYCoord = (value: number) => {
        // SVG coordinates are inverted by default
        const v = invertYAxis ? value : maxValue - value
        return (v * height) / maxValue
    }

    const commonProps = {
        chartState,
        chartValues,
        interval,
        width,
        height,
        totalItems,
        lineLabel,
        maxValue,
        formatValue,
        question,
        getXCoord,
        getYCoord
    }

    return (
        <g
            data-id={id}
            style={style}
            className={`chart-line ${highlightIsActive ? 'chart-line-highlightActive' : ''} ${
                isHighlighted ? 'chart-line-highlighted' : ''
            }`}
        >
            {take(editions, editions.length - 1).map((edition, i) => {
                // line starts at the index for the current edition's year
                const startIndex = years.findIndex(year => year === edition.year)
                // line ends at the index for the next edition's year
                const nextEdition = editions[i + 1]
                const endIndex = years.findIndex(year => year === nextEdition.year)
                return (
                    <LineSegment
                        {...commonProps}
                        key={edition.editionId}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        value1={getEditionValue(edition, chartState)}
                        value2={getEditionValue(editions[i + 1], chartState)}
                    />
                )
            })}
            {years.map((year, i) => {
                const edition = getEditionByYear(year, editions)
                return edition ? (
                    <Dot
                        {...commonProps}
                        key={edition.editionId}
                        editionIndex={i}
                        year={year}
                        value={getEditionValue(edition, chartState)}
                    />
                ) : null
            })}
        </g>
    )
}

const Dot = ({
    lineLabel,
    editionIndex,
    value,
    formatValue,
    question,
    year,
    getXCoord,
    getYCoord
}: {
    lineLabel: string
    editionIndex: number
    value: number
    formatValue: ViewDefinition['formatValue']
    question: QuestionMetadata
    year: number
    getXCoord: (value: number) => number
    getYCoord: (value: number) => number
}) => {
    const cx = getXCoord(editionIndex)
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
                        {formatValue(value, question)}
                    </text>
                </g>
            }
            contents={`${lineLabel}: ${formatValue(value, question)} (${year})`}
            asChild={true}
        />
    )
}

const LineSegment = ({
    lineLabel,
    startIndex,
    endIndex,
    value1,
    value2,
    getXCoord,
    getYCoord
}: {
    lineLabel: string
    startIndex: number
    endIndex: number
    value1: number
    value2: number
    getXCoord: (value: number) => number
    getYCoord: (value: number) => number
}) => {
    const x1 = getXCoord(startIndex)
    const x2 = getXCoord(endIndex)
    const y1 = getYCoord(value1)
    const y2 = getYCoord(value2)
    return (
        <Tooltip
            trigger={
                <g>
                    <path className="chart-line-segment" d={`M${x1} ${y1} L${x2} ${y2}`} />
                    <path
                        className="chart-line-segment-invisible"
                        d={`M${x1} ${y1} L${x2} ${y2}`}
                    />
                </g>
            }
            contents={lineLabel}
            asChild={true}
        />
    )
}
