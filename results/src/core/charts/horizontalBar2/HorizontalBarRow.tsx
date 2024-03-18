import React, { useState } from 'react'
import { RowWrapper } from '../common2/RowWrapper'
import { Cell } from './HorizontalBarCell'
import { RowCommonProps, RowExtraProps } from '../common2/types'
import take from 'lodash/take'
import sum from 'lodash/sum'
import { RowDataProps } from './types'
import { useTheme } from 'styled-components'
import { getRowComponent, getValue } from './helpers/other'
import { useColorScale } from './helpers/colors'

export const Row = (props: RowDataProps & RowCommonProps) => {
    const [showGroupedBuckets, setShowGroupedBuckets] = useState(false)
    const { bucket, chartState } = props
    const { groupedBuckets } = bucket
    const hasGroupedBuckets = groupedBuckets && groupedBuckets.length > 0
    const RowComponent = getRowComponent(bucket, chartState)
    const rowComponentProps = {
        ...props,
        ...(hasGroupedBuckets ? { showGroupedBuckets, setShowGroupedBuckets } : {})
    }
    return (
        <>
            <RowComponent {...rowComponentProps} />
            {hasGroupedBuckets &&
                showGroupedBuckets &&
                groupedBuckets.map(groupedBucket => (
                    <RowComponent
                        key={groupedBucket.id}
                        {...props}
                        bucket={groupedBucket}
                        isGroupedBucket={true}
                    />
                ))}
        </>
    )
}

export const SingleBarRow = (props: RowDataProps & RowCommonProps & RowExtraProps) => {
    const { bucket, chartState, chartValues } = props
    const value = getValue(bucket, chartState)
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
    const { maxOverallValue } = chartValues
    const { facetBuckets } = bucket
    return (
        <RowWrapper {...props}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const value = getValue(facetBucket, chartState)
                    const ratio = 100 / maxOverallValue
                    const width = value * ratio
                    const offset = sum(
                        take(
                            facetBuckets.map(b => getValue(b, chartState) * ratio),
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
