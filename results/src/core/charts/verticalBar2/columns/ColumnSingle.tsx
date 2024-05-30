import { ColumnDataProps } from '../types'
import { getViewDefinition } from '../helpers/views'
import { useTheme } from 'styled-components'
import { ColumnWrapper, RespondentCount } from '../../common2'
import React from 'react'
import { Cell } from '../VerticalBarCell'
import max from 'lodash/max'

export const ColumnSingle = (props: ColumnDataProps & RowCommonProps & RowExtraProps) => {
    const theme = useTheme()
    const { edition, chartState, chartValues, showCount = true } = props
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const { ticks } = chartValues

    const value = getValue(edition)
    const gradient = theme.colors.barChart.primaryGradient

    const rowMetadata = <RespondentCount count={edition.completion.count} />
    const rowWrapperProps = showCount ? { ...props, rowMetadata } : props

    const maxValue = max(ticks.map(tick => tick.value))
    const height = (value * 100) / maxValue

    return (
        <ColumnWrapper {...rowWrapperProps}>
            <Cell
                edition={edition}
                value={value}
                chartState={chartState}
                offset={0}
                height={height}
                cellIndex={0}
                chartValues={chartValues}
                gradient={gradient}
            />
        </ColumnWrapper>
    )
}
