import React from 'react'
import take from 'lodash/take'
import { useTheme } from 'styled-components'
import { BasicPointData, LineItem } from '../types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { getQuestionLabel } from 'core/charts/common2/helpers/labels'
import { ModesEnum } from 'core/charts/multiItemsRatios/types'
import { Dot } from './Dot'
import { LineSegment } from './LineSegment'
import { getDistinctColor } from 'core/charts/common2/helpers/colors'
import { ChartStateWithHighlighted } from 'core/charts/common2/types'
import { getSubsetIds, subsetFunctions } from 'core/charts/multiItemsRatios/helpers/subsets'
import { LinesComponentProps } from './Lines'

export type LineComponentProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = LinesComponentProps<SerieData, PointData, ChartStateType> &
    LineItem<PointData> & {
        lineIndex: number
        subsetLineIndex: number
        width: number
        height: number
        hasMultiple?: boolean
        isDisabled: boolean
    }

export const Line = <
    SerieData,
    PointData extends BasicPointData,
    ChartStateType extends ChartStateWithHighlighted
>(
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
        subsetLineIndex,
        width,
        height,
        hasMultiple = false,
        isDisabled
    } = props
    const { getString } = useI18n()
    const theme = useTheme()
    const { highlighted, setHighlighted, view, mode, subset } = chartState
    const { getPointValue } = viewDefinition
    const invertYAxis = mode === ModesEnum.RANK
    const {
        totalColumns,
        minValue,
        maxValue,
        maxTick,
        minTick,
        columnIds,
        question,
        legendItems = [],
        i18nNamespace
    } = chartValues
    if (!getPointValue) {
        throw new Error(`getPointValue not defined for view ${view}`)
    }

    const lineColor = isDisabled
        ? 'rgba(255,255,255)'
        : hasMultiple
        ? getDistinctColor(theme.colors.distinct, subsetLineIndex)
        : theme.colors.barChart.primaryGradient[0]

    const style = {
        color: lineColor
    }

    let lineLabel
    if (entity) {
        const labelObject = getItemLabel({ id, entity, getString, i18nNamespace })
        lineLabel = labelObject.label
    } else if (question) {
        const labelObject = getQuestionLabel({ question, getString, i18nNamespace })
        lineLabel = labelObject.label
    }

    const highlightIsActive = highlighted !== null
    const isHighlighted = highlighted === id
    const interval = width / totalColumns
    const totalItems = legendItems.length

    const getXCoord = (columnIndex: number) => interval * columnIndex + interval / 2
    const getYCoord = (value: number) => {
        // we use either the largest tick value, or the largest chart value
        // (can be different if ticks are defined manually)
        const chartMax = maxTick ?? maxValue

        // we use either the smallest tick value, or the smallest chart value
        // (can be different if ticks are defined manually)
        const chartMin = minTick ?? minValue
        // SVG coordinates are inverted by default
        const v = invertYAxis ? value : chartMax - value
        // calculate delta between lower axis (min value) and top axis (max value)
        const delta = chartMax - chartMin
        return (v * height) / delta
    }

    const commonProps = {
        ...props,
        interval,
        width,
        height,
        totalItems,
        lineLabel,
        maxValue,
        maxTick,
        question,
        getXCoord,
        getYCoord
    }

    return (
        <g
            data-id={id}
            data-lineindex={lineIndex}
            data-subsetlineindex={subsetLineIndex}
            style={style}
            className={`chart-line ${isDisabled ? 'chart-line-disabled' : 'chart-line-enabled'} ${
                highlightIsActive ? 'chart-line-highlightActive' : ''
            } ${isHighlighted ? 'chart-line-highlighted' : ''}`}
            onMouseOver={() => {
                setHighlighted(id)
            }}
            onMouseLeave={() => {
                setHighlighted(null)
            }}
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
