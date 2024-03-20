import React from 'react'
import { RowWrapper } from '../common2/RowWrapper'
import { Cell } from './HorizontalBarCell'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import take from 'lodash/take'
import sum from 'lodash/sum'
import { RowDataProps } from './types'
import { getViewDefinition } from './helpers/views'

export const SingleBarRow = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const { bucket, chartState, chartValues } = props
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const value = getValue(bucket)
    const width = (100 * value) / chartValues.maxOverallValue
    return (
        <RowWrapper {...props}>
            <div className="chart-bar">
                <Cell
                    bucket={bucket}
                    chartState={chartState}
                    width={width}
                    offset={0}
                    cellIndex={0}
                    chartValues={chartValues}
                />
            </div>
        </RowWrapper>
    )
}

export const FacetRow = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const { bucket, chartState, chartValues } = props
    const viewDefinition = getViewDefinition(chartState.view)
    const { getValue } = viewDefinition
    const { maxOverallValue } = chartValues
    const { facetBuckets } = bucket
    return (
        <RowWrapper {...props}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const value = getValue(facetBucket)
                    const ratio = 100 / maxOverallValue
                    const width = value * ratio
                    const offset = sum(
                        take(
                            facetBuckets.map(b => getValue(b) * ratio),
                            index
                        )
                    )
                    return (
                        <Cell
                            key={id}
                            bucket={facetBucket}
                            chartState={chartState}
                            width={width}
                            offset={offset}
                            cellIndex={index}
                            chartValues={chartValues}
                        />
                    )
                })}
            </div>
        </RowWrapper>
    )
}

export const BoxPlotRow = () => {
    return <div>boxplotrow</div>
}
