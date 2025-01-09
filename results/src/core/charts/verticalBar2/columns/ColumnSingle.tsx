import {
    BasicPointData,
    EmptyColumnProps,
    VerticalBarChartValues,
    VerticalBarViewDefinition
} from '../types'
import { useTheme } from 'styled-components'
import { RespondentCount } from '../../common2'
import React from 'react'
import { Cell } from '../VerticalBarCell'
import { ColumnWrapper } from './ColumnWrapper'

type ColumnSingleProps<
    SerieData,
    PointData extends BasicPointData,
    ChartStateType
> = EmptyColumnProps<PointData> & {
    chartValues: VerticalBarChartValues
    point: PointData
    rowMetadata?: JSX.Element
    children?: JSX.Element
    viewDefinition: VerticalBarViewDefinition<SerieData, PointData, ChartStateType>
}

export const ColumnSingle = <SerieData, PointData extends BasicPointData, ChartStateType>(
    props: ColumnSingleProps<SerieData, PointData, ChartStateType>
) => {
    const theme = useTheme()
    const { point, chartState, chartValues, showCount = true, viewDefinition } = props
    const { getPointValue } = viewDefinition
    const { maxValue } = chartValues

    if (!getPointValue) {
        throw new Error('getPointValue not defined')
    }

    const value = point && getPointValue(point, chartState)

    const gradient = theme.colors.barChart.primaryGradient

    const rowMetadata = <RespondentCount count={point?.completion?.count} />
    const columnWrapperProps = showCount ? { ...props, rowMetadata } : props

    const height = (value * 100) / maxValue

    return (
        <ColumnWrapper {...columnWrapperProps}>
            <Cell
                point={point}
                value={value}
                chartState={chartState}
                offset={0}
                height={height}
                cellIndex={0}
                chartValues={chartValues}
                gradient={gradient}
                viewDefinition={viewDefinition}
            />
        </ColumnWrapper>
    )
}
