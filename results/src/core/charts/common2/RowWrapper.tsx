import React from 'react'
import { RowHeading } from '../common2/RowHeading'
import { RowCommonProps, RowExtraProps } from './types'
import { UserIcon } from 'core/icons'
import classNames from 'classnames'
import { OVERALL } from '@devographics/constants'
import { RowDataProps } from '../horizontalBar2/types'

export const RowWrapper = (
    props: RowDataProps & RowCommonProps & RowExtraProps & { children: JSX.Element }
) => {
    const { chartState, bucket, isGroupedBucket = false, children } = props
    const isOverallBucket = bucket.id === OVERALL
    const className = classNames(
        'chart-row',
        { 'chart-row-grouped': isGroupedBucket },
        { 'chart-row-overall': isOverallBucket }
    )

    return (
        <div className={className}>
            <div className="chart-row-left">
                <RowHeading {...props} />
            </div>
            <div className="chart-row-content">{children}</div>
            <div className="chart-row-right">
                <div className="chart-row-metadata">
                    <UserIcon size={'small'} /> {bucket.count}
                </div>
            </div>
        </div>
    )
}
