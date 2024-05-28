import React from 'react'
import { Cell } from './VerticalBarCell'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import { RowDataProps } from './types'
import { getViewDefinition } from './helpers/views'
import { useGradient } from '../horizontalBar2/helpers/colors'
import { useTheme } from 'styled-components'
import { ColumnWrapper, FreeformIndicator, RespondentCount, RowHeading } from '../common2'
import classNames from 'classnames'
import { OVERALL } from '@devographics/constants'

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

export const FacetColumn = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const { bucket, chartState, chartValues, rowIndex, allRowsCellDimensions, allRowsOffsets } =
        props
    const { facetQuestion } = chartValues
    const { facetBuckets } = bucket

    const rowDimensions = allRowsCellDimensions[rowIndex]
    const rowOffset = allRowsOffsets[rowIndex]

    return (
        <ColumnWrapper {...props} rowMetadata={<RespondentCount count={bucket.count} />}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const { width, offset } = rowDimensions[index]
                    const gradient = useGradient({ id: facetBucket.id, question: facetQuestion })
                    return (
                        <Cell
                            key={id}
                            bucket={facetBucket}
                            chartState={chartState}
                            width={width}
                            offset={offset - rowOffset}
                            cellIndex={index}
                            chartValues={chartValues}
                            gradient={gradient}
                        />
                    )
                })}
            </div>
        </ColumnWrapper>
    )
}
