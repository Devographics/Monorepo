import React from 'react'
import { Bucket } from '@devographics/types'

type DepthIndicatorProps = {
    hasNestedBuckets?: boolean
    nestedBuckets?: Bucket[]
    showNestedBuckets: boolean
    setShowNestedBuckets: React.Dispatch<React.SetStateAction<boolean>>
    depth?: number
}

export const RowDepth = ({
    hasNestedBuckets = false,
    showNestedBuckets,
    setShowNestedBuckets,
    nestedBuckets,
    depth = 0
}: DepthIndicatorProps) => {
    return (
        <div className="chart-depth-indicator" style={{ '--totalDepth': depth }}>
            <div className="chart-depth-vertical">
                {[...Array(depth + 1)].map((x, index) => (
                    <div
                        key={index}
                        style={{ '--depth': index }}
                        className={`chart-depth-segment chart-depth-segment-${index} chart-depth-segment-${
                            index === depth ? 'edge' : ''
                        }`}
                    />
                ))}
            </div>
            <div className="chart-depth-horizontal">
                <div className="chart-depth-line" />
                {hasNestedBuckets ? (
                    <button
                        className="chart-depth-node chart-depth-node-button"
                        onClick={() => setShowNestedBuckets(!showNestedBuckets)}
                        aria-expanded={showNestedBuckets}
                    >
                        {showNestedBuckets ? '-' : `+${nestedBuckets?.length}`}
                    </button>
                ) : (
                    <div className="chart-depth-node" />
                )}
            </div>
        </div>
    )
}
