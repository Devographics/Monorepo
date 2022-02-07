import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useSpring, animated } from '@react-spring/web'
import { useMotionConfig } from '@nivo/core'
import { ToolsScatterPlotMetric } from './types'

interface QuadrantProps {
    metric: ToolsScatterPlotMetric
    index: number
    label: string
    color: string
    x: number
    y: number
    width: number
    height: number
    isZoomed: boolean
    toggleZoom: (quadrantIndex: number) => void
}

export const Quadrant = ({
    metric,
    index,
    label,
    color,
    x,
    y,
    width,
    height,
    isZoomed,
    toggleZoom,
}: QuadrantProps) => {
    const handleClick = useCallback(() => {
        toggleZoom(index)
    }, [toggleZoom, index])

    const { animate, config: springConfig } = useMotionConfig()
    const transition = useSpring({
        x,
        y,
        width,
        height,
        textX: x + width / 2,
        textY: y + height / 2,
        config: springConfig,
        immediate: !animate,
    })

    return (
        <>
            <animated.rect
                x={transition.x}
                y={transition.y}
                width={transition.width}
                height={transition.height}
                fill={color}
                onClick={handleClick}
                style={{
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                }}
            />
            {metric === 'satisfaction' && (
                <QuadrantLabel
                    x={transition.textX}
                    y={transition.textY}
                    textAnchor="middle"
                    alignmentBaseline="central"
                >
                    {label}
                </QuadrantLabel>
            )}
        </>
    )
}

const QuadrantLabel = styled(animated.text)`
    color: #E3D8C4;
    fill: #E3D8C4;
    text-transform: uppercase;
    letter-spacing: 3px;
    opacity: 0.75;
    font-size: ${({ theme }) => theme.typography.size.larger};
    user-select: none;
    pointer-events: none;
`