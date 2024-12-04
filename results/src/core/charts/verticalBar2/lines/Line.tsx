import React from 'react'
import take from 'lodash/take'
import { useTheme } from 'styled-components'
import {
    BasicPointData,
    LineItem,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { getQuestionLabel } from 'core/charts/common2/helpers/labels'
import { ModesEnum } from 'core/charts/multiItemsRatios/types'
import { BlockVariantDefinition } from 'core/types'
import { Dot } from './Dot'
import { LineSegment } from './LineSegment'

export type LineComponentProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = LineItem<PointData> & {
    chartState: ChartStateType
    chartValues: VerticalBarChartValues
    block: BlockVariantDefinition
    lineIndex: number
    width: number
    height: number
    hasMultiple?: boolean
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export const Line = <SerieData, PointData extends BasicPointData, ChartStateType>(
    props: LineComponentProps<SerieData, PointData, ChartStateType>
) => {
    const {
        id,
        entity,
        chartState,
        chartValues,
        viewDefinition,
        points,
        lineIndex,
        width,
        height,
        hasMultiple = false
    } = props
    const { getString } = useI18n()

    const theme = useTheme()
    const { highlighted, view, mode } = chartState
    const { getPointValue } = viewDefinition
    const invertYAxis = mode === ModesEnum.RANK
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

    const getXCoord = (columnIndex: number) => interval * columnIndex + interval / 2
    const getYCoord = (value: number) => {
        // SVG coordinates are inverted by default
        const v = invertYAxis ? value : maxValue - value
        return (v * height) / maxValue
    }

    const commonProps = {
        ...props,
        interval,
        width,
        height,
        totalItems,
        lineLabel,
        maxValue,
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
                // line starts at the index for the current point
                const startIndex = point.columnIndex
                // line ends at the index for the next point
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
                // find the point corresponding to the current column, if it exists
                // (some lines might skip across columns sometimes)
                const point = points.find(p => p.columnId === columnId)
                return point ? (
                    <Dot<SerieData, PointData, ChartStateType>
                        {...commonProps}
                        key={point.id}
                        pointIndex={i}
                        columnId={columnId}
                        value={getPointValue(point, chartState)}
                    />
                ) : null
            })}
        </g>
    )
}
