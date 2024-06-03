import React, { useEffect } from 'react'
import take from 'lodash/take'
import { useTheme } from 'styled-components'
import { getEditionByYear } from '../helpers/other'
import Tooltip from 'core/components/Tooltip'
import { LineComponentProps } from '../types'
import { ViewDefinition } from 'core/charts/common2/types'
import { Entity, QuestionMetadata } from '@devographics/types'
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
    const theme = useTheme()
    const { viewDefinition, highlighted } = chartState
    const { getEditionValue, formatValue } = viewDefinition
    const { totalColumns, maxValue, years, question } = chartValues
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

    const highlightIsActive = highlighted !== null
    const isHighlighted = highlighted === id
    const interval = 100 / totalColumns
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
                        key={edition.editionId}
                        interval={interval}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        value1={getEditionValue(edition, chartState)}
                        value2={getEditionValue(editions[i + 1], chartState)}
                        maxValue={maxValue}
                        width={width}
                        height={height}
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
                        formatValue={formatValue}
                        question={question}
                        year={year}
                        entity={entity}
                        id={id}
                        value={getEditionValue(edition, chartState)}
                        // width={width}
                        // height={height}
                    />
                ) : null
            })}
        </g>
    )
}

const Dot = ({
    id,
    editionIndex,
    interval,
    maxValue,
    value,
    formatValue,
    question,
    year,
    entity
}: {
    id: string
    editionIndex: number
    interval: number
    maxValue: number
    value: number
    formatValue: ViewDefinition['formatValue']
    question: QuestionMetadata
    year: number
    entity?: Entity
}) => {
    const { getString } = useI18n()
    const cx = interval * editionIndex + interval / 2
    const cy = 100 - (value * 100) / maxValue
    const { label } = getItemLabel({ id, entity, getString })
    return (
        <Tooltip
            trigger={
                <g className="chart-line-dot">
                    <circle
                        className="chart-line-dot-visible"
                        cx={`${cx}%`}
                        cy={`${cy}%`}
                        r={dotRadius}
                    />
                    <circle
                        className="chart-line-dot-invisible"
                        cx={`${cx}%`}
                        cy={`${cy}%`}
                        r={dotRadius * 3}
                    />
                    {/* <text className="chart-line-label" x={`${cx}%`} y={`${cy + 10}%`}>
                        {value}
                    </text> */}
                </g>
            }
            contents={`${label}: ${formatValue(value, question)} (${year})`}
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
    maxValue,
    width,
    height
}: {
    interval: number
    startIndex: number
    endIndex: number
    value1: number
    value2: number
    maxValue: number
    width: number
    height: number
}) => {
    const x1 = ((interval * startIndex + interval / 2) * width) / 100
    const x2 = ((interval * endIndex + interval / 2) * width) / 100
    const y1 = ((100 - (value1 * 100) / maxValue) * height) / 100
    const y2 = ((100 - (value2 * 100) / maxValue) * height) / 100
    return <path className="chart-line-segment" d={`M${x1} ${y1} L${x2} ${y2}`} />
    // return (
    //     <line
    //         className="chart-line-segment"
    //         x1={`${x1}%`}
    //         y1={`${y1}%`}
    //         x2={`${x2}%`}
    //         y2={`${y2}%`}
    //     />
    // )
}
