import './Row.scss'
import React, { useState } from 'react'
import { RowCommonProps, RowComponent } from '../common2/types'
import { RowDataProps } from '../horizontalBar2/types'

export const BAR_HEIGHT = 25

export const Row = (props: { rowComponent: RowComponent } & RowDataProps & RowCommonProps) => {
    const [showGroupedBuckets, setShowGroupedBuckets] = useState(false)
    const { bucket, rowComponent } = props
    const { groupedBuckets } = bucket
    const hasGroupedBuckets = groupedBuckets && groupedBuckets.length > 0
    const RowComponent = rowComponent
    const rowComponentProps = {
        ...props,
        hasGroupedBuckets,
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
