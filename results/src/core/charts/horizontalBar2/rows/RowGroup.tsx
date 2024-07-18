import './Row.scss'
import React, { useState } from 'react'
import { RowGroupProps } from '../types'

export const BAR_HEIGHT = 25

export const RowGroup = (props: RowGroupProps) => {
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
