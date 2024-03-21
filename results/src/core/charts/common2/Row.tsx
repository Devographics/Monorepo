import React, { useState } from 'react'
import { RowCommonProps } from '../common2/types'
import { RowDataProps } from '../horizontalBar2/types'

export const ROW_HEIGHT = 30

export const Row = (props: { rowComponent: JSX.Element } & RowDataProps & RowCommonProps) => {
    const [showGroupedBuckets, setShowGroupedBuckets] = useState(false)
    const { bucket, rowComponent } = props
    const { groupedBuckets } = bucket
    const hasGroupedBuckets = groupedBuckets && groupedBuckets.length > 0
    const RowComponent = rowComponent
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
