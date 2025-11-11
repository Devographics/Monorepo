import './Row.scss'
import React, { useState } from 'react'
import { RowGroupProps } from '../types'

export const BAR_HEIGHT = 25

export const RowGroup = (props: RowGroupProps) => {
    const [showNestedBuckets, setShowNestedBuckets] = useState(false)
    const { bucket, rowComponent, depth = 0 } = props
    const { nestedBuckets } = bucket
    const hasNestedBuckets = nestedBuckets && nestedBuckets.length > 0
    const RowComponent = rowComponent
    const rowComponentProps = {
        ...props,
        depth,
        hasNestedBuckets,
        ...(hasNestedBuckets ? { showNestedBuckets, setShowNestedBuckets } : {})
    }
    return (
        <>
            <RowComponent {...rowComponentProps} />
            {hasNestedBuckets &&
                showNestedBuckets &&
                nestedBuckets.map((groupedBucket, index) => (
                    <RowGroup
                        {...props}
                        isNestedBucket={true}
                        bucket={groupedBucket}
                        key={groupedBucket.id}
                        isLastChild={index === nestedBuckets.length - 1}
                        depth={depth + 1}
                    />
                ))}
        </>
    )
}
