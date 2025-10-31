import './Row.scss'
import React, { useState } from 'react'
import { RowGroupProps } from '../types'

export const BAR_HEIGHT = 25

export const RowGroup = (props: RowGroupProps) => {
    const [showGroupedBuckets, setShowGroupedBuckets] = useState(false)
    const { bucket, rowComponent, depth = 0 } = props
    const { groupedBuckets } = bucket
    const hasGroupedBuckets = groupedBuckets && groupedBuckets.length > 0
    const RowComponent = rowComponent
    const rowComponentProps = {
        ...props,
        depth,
        hasGroupedBuckets,
        ...(hasGroupedBuckets ? { showGroupedBuckets, setShowGroupedBuckets } : {})
    }
    return (
        <>
            <RowComponent {...rowComponentProps} />
            {hasGroupedBuckets &&
                showGroupedBuckets &&
                groupedBuckets.map((groupedBucket, index) => (
                    <RowGroup
                        {...props}
                        isGroupedBucket={true}
                        bucket={groupedBucket}
                        key={groupedBucket.id}
                        isLastChild={index === groupedBuckets.length - 1}
                        depth={depth + 1}
                    />
                ))}
        </>
    )
    // return (
    //     <>
    //         <RowComponent {...rowComponentProps} />
    //         {hasGroupedBuckets &&
    //             showGroupedBuckets &&
    //             groupedBuckets.map(groupedBucket => (
    //                 <RowComponent
    //                     key={groupedBucket.id}
    //                     {...props}
    //                     bucket={groupedBucket}
    //                     isGroupedBucket={true}
    //                 />
    //             ))}
    //     </>
    // )
}
