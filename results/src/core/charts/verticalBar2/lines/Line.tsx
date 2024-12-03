import React from 'react'
import take from 'lodash/take'
import { useTheme } from 'styled-components'
import { getEditionByYear } from '../helpers/other'
import Tooltip from 'core/components/Tooltip'
import { BasicPointData, LineComponentProps } from '../types'
import { ViewDefinition } from 'core/charts/common2/types'
import { QuestionMetadata } from '@devographics/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { getQuestionLabel } from 'core/charts/common2/helpers/labels'

const dotRadius = 6

export const Line = <PointData extends BasicPointData>({
    id,
    entity,
    chartState,
    chartValues,
    points,
    lineIndex,
    width,
    height,
    hasMultiple = false
}: LineComponentProps<PointData>) => {
    const { getString } = useI18n()

    const theme = useTheme()
    const { viewDefinition, highlighted, view } = chartState
    const { getPointValue, formatValue, invertYAxis } = viewDefinition
    const {
        totalColumns,
        maxValue,
        columnIds,
        question,
        legendItems = [],
        i18nNamespace
    } = chartValues
    if (!getPointValue) {
        throw new Error(`getPointValue not defined for view ${view}`)
    }

    const lineColor = hasMultiple
        ? theme.colors.distinct[lineIndex]
        : theme.colors.barChart.primaryGradient[0]
    const style = {
        color: lineColor
    }

    let lineLabel
    if (entity) {
        const labelObject = getItemLabel({ id, entity, getString, i18nNamespace })
        lineLabel = labelObject.label
    } else {
        const labelObject = getQuestionLabel({ question, getString, i18nNamespace })
        lineLabel = labelObject.label
    }

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
            {take(points, points.length - 1).map((point, i) => {
                // line starts at the index for the current edition's year
                const startIndex = point.columnIndex
                // line ends at the index for the next edition's year
                const nextPoint = points[i + 1]
                const endIndex = nextPoint.columnIndex
                return (
                    <LineSegment
                        {...commonProps}
                        key={point.id}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        value1={getPointValue(point, chartState)}
                        value2={getPointValue(points[i + 1], chartState)}
                    />
                )
            })}
            {columnIds.map((columnId, i) => {
                const edition = getEditionByYear(columnId, points)
                return edition ? (
                    <Dot
                        {...commonProps}
                        key={edition.editionId}
                        editionIndex={i}
                        columnId={columnId}
                        value={getPointValue(edition, chartState)}
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
    columnId,
    getXCoord,
    getYCoord
}: {
    lineLabel: string
    editionIndex: number
    value: number
    formatValue: ViewDefinition['formatValue']
    question: QuestionMetadata
    columnId: string
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
            contents={`${lineLabel}: ${formatValue(value, question)} (${columnId})`}
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
