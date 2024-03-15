import React, { ReactNode } from 'react'
import { RowHeading } from '../common2/RowHeading'
import { RowComponentsProps } from './types'
import { UserIcon } from 'core/icons'

export const RowWrapper = (props: RowComponentsProps & { children: ReactNode }) => {
    const { bucket, isGroupedBucket = false, children } = props
    const className = `chart-row chart-row-${isGroupedBucket ? 'grouped' : 'ungrouped'}`
    return (
        <div className={className}>
            <RowHeading {...props} />
            <div className="chart-row-data">{children}</div>
            <div className="chart-row-metadata">
                <UserIcon size={16} /> {bucket.count}
            </div>
        </div>
    )
}
