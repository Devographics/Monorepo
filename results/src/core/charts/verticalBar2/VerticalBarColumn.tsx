import React from 'react'
import { Cell } from './VerticalBarCell'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import { RowDataProps } from './types'
import { getViewDefinition } from './helpers/views'
import { useTheme } from 'styled-components'
import { ColumnWrapper, RespondentCount } from '../common2'

export const SingleBarColumn = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const theme = useTheme()
    const { block, edition, chartState, chartValues, showCount = true, hasGroupedBuckets } = props
    const { question, maxOverallValue = 1 } = chartValues
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const value = 10
    // const value = getValue(bucket)
    const width = (100 * value) / maxOverallValue
    const gradient = theme.colors.barChart.primaryGradient

    const rowMetadata = <RespondentCount count={edition.completion.count} />
    const rowWrapperProps = showCount ? { ...props, rowMetadata } : props

    return (
        <ColumnWrapper {...rowWrapperProps}>
            <>
                <Cell
                    bucket={{}}
                    chartState={chartState}
                    width={width}
                    offset={0}
                    cellIndex={0}
                    chartValues={chartValues}
                    gradient={gradient}
                />
            </>
        </ColumnWrapper>
    )
}
