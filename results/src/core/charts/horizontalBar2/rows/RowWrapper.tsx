import React from 'react'
import { RowHeading } from './RowHeading'
import classNames from 'classnames'
import { OVERALL } from '@devographics/constants'
import { Gridlines } from './Gridlines'
import { RowComponentProps } from '../types'

export const RowWrapper = (
    props: RowComponentProps & { rowMetadata?: JSX.Element; children: JSX.Element }
) => {
    const {
        chartState,
        chartValues,
        bucket,
        isGroupedBucket = false,
        children,
        rowMetadata,
        rowIndex
    } = props
    const { ticks } = chartValues
    const { isFreeformData } = bucket
    const isOverallBucket = bucket.id === OVERALL
    const className = classNames(
        'chart-row',
        'chart-subgrid',
        { 'chart-row-grouped': isGroupedBucket },
        { 'chart-row-overall': isOverallBucket },
        { 'chart-row-insufficient-data': bucket.hasInsufficientData }
    )

    return (
        <div className={className}>
            <div className="chart-row-left">
                <div className="chart-row-index">{rowIndex + 1}</div>
                <RowHeading {...props} />
            </div>
            <div className="chart-row-content">
                {ticks && <Gridlines ticks={ticks} />}
                <div className="chart-bar">{children}</div>
            </div>
            {rowMetadata && <div className="chart-row-right">{rowMetadata}</div>}
        </div>
    )
}
