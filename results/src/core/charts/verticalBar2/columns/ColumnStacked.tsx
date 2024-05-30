import { ColumnComponentProps } from '../types'
import { getViewDefinition } from '../helpers/views'
import React from 'react'
import { Cell } from '../VerticalBarCell'
import { useGradient } from '../../horizontalBar2/helpers/colors'
import max from 'lodash/max'
import sum from 'lodash/sum'
import take from 'lodash/take'
import { ColumnWrapper } from './ColumnWrapper'

export const ColumnStacked = (props: ColumnComponentProps) => {
    const { edition, chartState, chartValues } = props
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const { question, ticks } = chartValues
    // const rowDimensions = allRowsCellDimensions[rowIndex]
    // const rowOffset = allRowsOffsets[rowIndex]

    const maxValue = max(ticks.map(tick => tick.value))

    return (
        <ColumnWrapper {...props}>
            <div className="chart-faceted-bar">
                {edition.buckets.map((bucket, index) => {
                    const { id } = bucket
                    const gradient = useGradient({ id: bucket.id, question })

                    const value = getValue(bucket)
                    const height = (value * 100) / maxValue
                    const values = edition.buckets.map(bucket => getValue(bucket))
                    const offset = sum(take(values, index))

                    return (
                        <Cell
                            key={id}
                            edition={edition}
                            maxValue={maxValue}
                            value={value}
                            chartState={chartState}
                            height={height}
                            offset={offset}
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
