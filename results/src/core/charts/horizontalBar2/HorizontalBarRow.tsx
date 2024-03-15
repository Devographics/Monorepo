import React, { useState } from 'react'
import { RowWrapper } from '../common2/RowWrapper'
import { Cell } from './HorizontalBarCell'
import { RowComponentsProps, RowProps } from '../common2/types'
import take from 'lodash/take'
import sum from 'lodash/sum'

export const Row = (props: RowProps) => {
    const [showGroupedBuckets, setShowGroupedBuckets] = useState(false)
    const { bucket } = props
    const { facetBuckets, groupedBuckets } = bucket
    const hasFacetBuckets = facetBuckets && facetBuckets.length > 0
    const hasGroupedBuckets = groupedBuckets && groupedBuckets.length > 0
    const RowComponent = hasFacetBuckets ? FacetRow : SingleBarRow
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

export const SingleBarRow = (props: RowComponentsProps) => {
    const { bucket, chartState, chartValues } = props
    const { variable } = chartState
    const width = (100 * (bucket[variable] || 0)) / chartValues.maxOverallValue
    return (
        <RowWrapper {...props}>
            <div className="chart-bar">
                <Cell
                    bucket={bucket}
                    color="#ffffff44"
                    chartState={chartState}
                    width={width}
                    offset={0}
                />
            </div>
        </RowWrapper>
    )
}

export const FacetRow = (props: RowComponentsProps) => {
    const { bucket, chartState, chartValues } = props
    const { facetBuckets } = bucket
    const { variable } = chartState
    const width = (100 * (bucket[variable] || 0)) / chartValues.maxOverallValue
    return (
        <RowWrapper {...props}>
            <div className="chart-faceted-bar">
                {facetBuckets.map((facetBucket, index) => {
                    const { id } = facetBucket
                    const value = facetBucket.percentageBucket || 0
                    const ratio = 100 / chartValues.maxOverallValue
                    const width = value * ratio
                    const offset = sum(
                        take(
                            facetBuckets.map(b => (b.percentageBucket || 0) * ratio),
                            index
                        )
                    )
                    const color = ['red', 'green', 'blue', 'teal', 'purple', 'yellow', 'pink'][
                        index
                    ]
                    return (
                        <Cell
                            key={id}
                            bucket={facetBucket}
                            color={color}
                            chartState={chartState}
                            width={width}
                            offset={offset}
                        />
                    )
                })}
            </div>
        </RowWrapper>
    )
}
