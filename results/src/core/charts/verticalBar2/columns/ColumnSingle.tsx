import { ColumnComponentProps } from '../types'
import { useTheme } from 'styled-components'
import { RespondentCount } from '../../common2'
import React from 'react'
import { Cell } from '../VerticalBarCell'
import { ColumnWrapper } from './ColumnWrapper'

export const ColumnSingle = (props: ColumnComponentProps) => {
    const theme = useTheme()
    const { year, edition, chartState, chartValues, showCount = true } = props
    const { viewDefinition } = chartState
    const { getPointValue } = viewDefinition
    const { maxValue } = chartValues

    if (!getPointValue) {
        throw new Error('getPointValue not defined')
    }

    const value = edition && getPointValue(edition, chartState)

    const gradient = theme.colors.barChart.primaryGradient

    const rowMetadata = <RespondentCount count={edition.completion.count} />
    const rowWrapperProps = showCount ? { ...props, rowMetadata } : props

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
