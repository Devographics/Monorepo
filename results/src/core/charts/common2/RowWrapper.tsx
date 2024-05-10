import React from 'react'
import { RowHeading } from '../common2/RowHeading'
import { RowCommonProps, RowExtraProps } from './types'
import { FreeformIcon, UserIcon } from 'core/icons'
import classNames from 'classnames'
import { OVERALL } from '@devographics/constants'
import { RowDataProps } from '../horizontalBar2/types'
import { Gridlines } from './Gridlines'

export const RowWrapper = (
    props: RowDataProps &
        RowCommonProps &
        RowExtraProps & { rowMetadata?: JSX.Element; children: JSX.Element }
) => {
    const {
        chartState,
        ticks,
        bucket,
        isGroupedBucket = false,
        children,
        rowMetadata,
        rowIndex
    } = props
    const { isFreeformData } = bucket
    const isOverallBucket = bucket.id === OVERALL
    const className = classNames(
        'chart-row',
        'chart-subgrid',
        { 'chart-row-grouped': isGroupedBucket },
        { 'chart-row-overall': isOverallBucket }
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
