import React, { ReactNode, useState } from 'react'
import { RowCommonProps } from '../common2/types'
import { RowDataProps } from '../horizontalBar2/types'

export const Row = (props: { rowComponent: ReactNode } & RowDataProps & RowCommonProps) => {
    const [showGroupedBuckets, setShowGroupedBuckets] = useState(false)
    const { bucket, chartState, rowComponent } = props
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
