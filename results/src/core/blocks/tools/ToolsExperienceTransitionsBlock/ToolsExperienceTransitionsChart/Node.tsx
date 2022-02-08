import React, { memo, useCallback, useState } from 'react'
import { ToolExperienceId } from 'core/bucket_keys'
import { SankeyNodeDatum } from '../types'

const style = {
    cursor: 'pointer'
}

const minHeight = 24

const NonMemoizedNode = ({
    node,
    isCurrent,
    setCurrentExperience,
}: {
    node: SankeyNodeDatum
    isCurrent: boolean
    setCurrentExperience: (experience: ToolExperienceId) => void
}) => {
    const [isHover, setIsHover] = useState(false)

    const handleHover = useCallback(() => {
        setIsHover(true)
    }, [setIsHover])

    const handleLeave = useCallback(() => {
        setIsHover(false)
    }, [setIsHover])

    const handleClick = useCallback(() => {
        setCurrentExperience(node.choice)
    }, [setCurrentExperience, node.choice])

    const centerX = node.x0 + (node.x1 - node.x0) / 2
    const centerY = node.y0 + (node.y1 - node.y0) / 2

    return (
        <>
            <rect
                x={node.x}
                y={node.y}
                width={node.width}
                height={node.height}
                rx={2}
                ry={2}
                fill={node.color}
                opacity={(isCurrent || isHover) ? 1 : .4}
                style={style}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
                onClick={handleClick}
            />
            {node.height >= minHeight && (
                <g transform={`translate(${centerX},${centerY}) rotate(-90)`}>
                    <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        style={{
                            fontSize: 10,
                            fontWeight: 600,
                            pointerEvents: 'none',
                        }}
                    >
                        {node.value}
                    </text>
                </g>
            )}
        </>
    )
}

export const Node = memo(NonMemoizedNode)
