import React from 'react'
import { Bucket } from '@devographics/types'
import { ChevronDownIcon, ChevronRightIcon } from '@devographics/icons'
import './RowDepth.scss'

type DepthIndicatorProps = {
    hasNestedBuckets?: boolean
    nestedBuckets?: Bucket[]
    showNestedBuckets: boolean
    setShowNestedBuckets: React.Dispatch<React.SetStateAction<boolean>>
    depth?: number
    totalDepth?: number
}

export const RowDepth = ({
    hasNestedBuckets = false,
    showNestedBuckets,
    setShowNestedBuckets,
    nestedBuckets,
    depth = 0,
    // not used
    totalDepth = 0
}: DepthIndicatorProps) => {
    // note: totalDepth does not work yet
    return (
        <div className="chart-depth-indicator" style={{ '--depth': depth, '--totalDepth': 99 }}>
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
                {depth > 0 && <div className="chart-depth-line" />}
                {hasNestedBuckets ? (
                    // <button
                    //     className="chart-depth-node chart-depth-node-button"
                    //     onClick={() => setShowNestedBuckets(!showNestedBuckets)}
                    //     aria-expanded={showNestedBuckets}
                    // >
                    //     {showNestedBuckets ? '-' : `+${nestedBuckets?.length}`}
                    // </button>
                    <button
                        className="chart-depth-node chart-depth-node-button"
                        onClick={() => setShowNestedBuckets(!showNestedBuckets)}
                        aria-expanded={showNestedBuckets}
                    >
                        {showNestedBuckets ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    </button>
                ) : (
                    <div className="chart-depth-node-empty" />
                )}
            </div>
        </div>
    )
}
