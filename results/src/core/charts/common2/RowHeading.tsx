import React from 'react'
import { RowComponentsProps } from './types'

export const RowHeading = ({
    bucket,
    isGroupedBucket,
    showGroupedBuckets,
    setShowGroupedBuckets
}: RowComponentsProps) => {
    const { entity, id, label } = bucket
    return (
        <h3 className="chart-row-heading">
            {isGroupedBucket && <span>↳&nbsp;</span>}
            <span>{label || entity?.nameClean || id}</span>
            {setShowGroupedBuckets && (
                <button onClick={() => setShowGroupedBuckets(!showGroupedBuckets)}>
                    {showGroupedBuckets ? '-' : `+${bucket.groupedBuckets?.length}`}
                </button>
            )}
        </h3>
    )
}
