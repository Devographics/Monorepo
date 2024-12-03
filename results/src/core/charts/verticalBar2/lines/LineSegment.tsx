import React from 'react'
import Tooltip from 'core/components/Tooltip'

export const LineSegment = ({
    lineLabel,
    startIndex,
    endIndex,
    value1,
    value2,
    getXCoord,
    getYCoord
}: {
    lineLabel: string
    startIndex: number
    endIndex: number
    value1: number
    value2: number
    getXCoord: (value: number) => number
    getYCoord: (value: number) => number
}) => {
    const x1 = getXCoord(startIndex)
    const x2 = getXCoord(endIndex)
    const y1 = getYCoord(value1)
    const y2 = getYCoord(value2)
    return (
        <Tooltip
            trigger={
                <g>
                    <path className="chart-line-segment" d={`M${x1} ${y1} L${x2} ${y2}`} />
                    <path
                        className="chart-line-segment-invisible"
                        d={`M${x1} ${y1} L${x2} ${y2}`}
                    />
                </g>
            }
            contents={lineLabel}
            asChild={true}
        />
    )
}
