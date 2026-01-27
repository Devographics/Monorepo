import React from 'react'
import { RowHeading } from './RowHeading'
import classNames from 'classnames'
import { OVERALL } from '@devographics/constants'
import { Gridlines } from './Gridlines'
import { RowComponentProps } from '../types'
import { RowDepth } from './RowDepth'

export const RowWrapper = (
    props: RowComponentProps & {
        rowMetadata?: JSX.Element
        children: JSX.Element
    }
) => {
    const {
        chartState,
        chartValues,
        bucket,
        buckets,
        items,
        isNestedBucket = false,
        children,
        rowMetadata,
        rowIndex,
        depth = 0,
        hasNestedBuckets,
        showNestedBuckets,
        setShowNestedBuckets,
        isLastChild,
        contentRef
    } = props
    const { highlightedRow, setHighlightedRow } = chartState
    const { ticks } = chartValues
    const isOverallBucket = bucket.id === OVERALL
    const className = classNames(
        'chart-row',
        `chart-row-depth-${depth}`,
        { 'chart-row-hasNestedBuckets': hasNestedBuckets },
        { 'chart-row-collapsed': !showNestedBuckets },
        { 'chart-row-expanded': showNestedBuckets },
        'chart-subgrid',
        { 'chart-row-grouped': isNestedBucket },
        { 'chart-row-overall': isOverallBucket },
        { 'chart-row-lastChild': isLastChild },
        { 'chart-row-insufficient-data': bucket.hasInsufficientData },
        { 'chart-row-highlighted': highlightedRow === bucket.id }
    )

    const showDepthIndicator = hasNestedBuckets || depth > 0

    const rowIndex_ = rowIndex + 1

    const itemLength = buckets?.length || items?.length
    const showSpacer = itemLength >= 10 && rowIndex_ < 10

    return (
        <div
            className={className}
            onClick={() => {
                setShowNestedBuckets && setShowNestedBuckets(!showNestedBuckets)
            }}
            onMouseEnter={() => {
                setHighlightedRow(bucket.id)
            }}
            onMouseLeave={() => {
                setHighlightedRow(null)
            }}
        >
            <div className="chart-row-left">
                <div className="chart-row-index">
                    {showSpacer && <span className="chart-row-index-spacer">0</span>}
                    {rowIndex_}
                </div>
                {showDepthIndicator ? (
                    <RowDepth
                        nestedBuckets={bucket.nestedBuckets}
                        hasNestedBuckets={hasNestedBuckets}
                        setShowNestedBuckets={setShowNestedBuckets}
                        showNestedBuckets={showNestedBuckets}
                        depth={depth}
                    />
                ) : (
                    <div className="chart-depth-placeholder" />
                )}
                <RowHeading {...props} nestedBuckets={bucket.nestedBuckets} />
            </div>
            <div className="chart-row-content" ref={contentRef}>
                {ticks && <Gridlines ticks={ticks} />}
                <div className="chart-bar">{children}</div>
            </div>
            {rowMetadata && <div className="chart-row-right">{rowMetadata}</div>}
        </div>
    )
}
