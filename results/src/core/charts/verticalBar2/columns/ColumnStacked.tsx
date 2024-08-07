import { ColumnComponentProps } from '../types'
import React from 'react'
import { Cell } from '../VerticalBarCell'
import { useGradient } from '../../common2/helpers/colors'
import sum from 'lodash/sum'
import take from 'lodash/take'
import { ColumnWrapper } from './ColumnWrapper'

export const ColumnStacked = (props: ColumnComponentProps) => {
    const { edition, chartState, chartValues } = props
    const { viewDefinition } = chartState
    const { getBucketValue } = viewDefinition
    if (!getBucketValue) {
        throw new Error('getBucketValue not defined')
    }
    const { question, maxValue } = chartValues

    // const rowDimensions = allRowsCellDimensions[rowIndex]
    // const rowOffset = allRowsOffsets[rowIndex]

    return (
        <ColumnWrapper {...props}>
            <div className="chart-faceted-bar">
                {edition.buckets.map((bucket, index) => {
                    const { id } = bucket
                    const gradient = useGradient({ id: bucket.id, question })

                    const value = getBucketValue(bucket)
                    const height = (value * 100) / maxValue
                    const values = edition.buckets.map(bucket => getBucketValue(bucket))
                    const offset = sum(take(values, index))

                    return (
                        <Cell
                            key={id}
                            edition={edition}
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
