import React from 'react'
import { RowHeading } from '../common2/RowHeading'
import { RowCommonProps, RowExtraProps } from './types'
import { UserIcon } from 'core/icons'
import classNames from 'classnames'
import { OVERALL } from '@devographics/constants'

export const RowWrapper = (props: RowCommonProps & RowExtraProps & { children: JSX.Element }) => {
    const { bucket, isGroupedBucket = false, children } = props
    const isOverallBucket = bucket.id === OVERALL
    const className = classNames(
        'chart-row',
        { 'chart-row-grouped': isGroupedBucket },
        { 'chart-row-overall': isOverallBucket }
    )

    return (
        <div className={className}>
            <RowHeading {...props} />
            <div className="chart-row-data">{children}</div>
            <div className="chart-row-metadata">
                <UserIcon size={'small'} /> {bucket.count}
            </div>
        </div>
    )
}
