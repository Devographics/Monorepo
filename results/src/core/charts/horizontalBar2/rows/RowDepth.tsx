import React from 'react'
import { Bucket } from '@devographics/types'

type DepthIndicatorProps = {
    hasGroupedBuckets?: boolean
    groupedBuckets?: Bucket[]
    showGroupedBuckets: boolean
    setShowGroupedBuckets: React.Dispatch<React.SetStateAction<boolean>>
    depth?: number
}

export const RowDepth = ({
    hasGroupedBuckets = false,
    showGroupedBuckets,
    setShowGroupedBuckets,
    groupedBuckets,
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
                {hasGroupedBuckets ? (
                    <button
                        className="chart-depth-node chart-depth-node-button"
                        onClick={() => setShowGroupedBuckets(!showGroupedBuckets)}
                        aria-expanded={showGroupedBuckets}
                    >
                        {showGroupedBuckets ? '-' : `+${groupedBuckets?.length}`}
                    </button>
                ) : (
                    <div className="chart-depth-node" />
                )}
            </div>
        </div>
    )
}
