import React, { useCallback, useMemo, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { useSpring, animated, to } from '@react-spring/web'
// import { useMotionConfig } from '@nivo/core'
import { springConfig, staticProps } from './config'
import { ScatterplotChartState } from './chartState'

interface QuadrantProps {
    quadrantIndex: number
    label: string
    color: string
    x: number
    y: number
    width: number
    height: number
    chartState: ScatterplotChartState
}

export const Quadrant = ({
    quadrantIndex,
    label,
    color,
    x,
    y,
    width,
    height,
    chartState
}: QuadrantProps) => {
    const { setZoomedQuadrantIndex, zoomedQuadrantIndex } = chartState
    const isZoomed = quadrantIndex === zoomedQuadrantIndex
    const [isHover, setIsHover] = useState(false)

    const handleMouseEnter = useCallback(() => {
        setIsHover(true)
    }, [setIsHover])

    const handleMouseLeave = useCallback(() => {
        setIsHover(false)
    }, [setIsHover])

    const handleClick = () => {
        setZoomedQuadrantIndex(isZoomed ? null : quadrantIndex)
    }

    const theme = useTheme()

    const transition = useSpring({
        x,
        y,
        width,
        height,
        textX: x + width / 2,
        textY: y + height / 2,
        strokeOpacity: isHover ? 0.4 : 0,
        config: springConfig,
        immediate: false
    })

    const backgroundStyle = useMemo(
        () => ({
            cursor: isZoomed ? 'zoom-out' : 'zoom-in'
        }),
        [isZoomed]
    )

    return (
        <>
            <animated.rect
                x={transition.x}
                y={transition.y}
                width={transition.width}
                height={transition.height}
                fill={color}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                style={backgroundStyle}
            />
            <QuadrantOutline
                x={to([transition.x], (x: number) => x + staticProps.quadrantBorder / 2)}
                y={to([transition.y], (y: number) => y + staticProps.quadrantBorder / 2)}
                width={to(
                    [transition.width],
                    (width: number) => width - staticProps.quadrantBorder
                )}
                height={to(
                    [transition.height],
                    (height: number) => height - staticProps.quadrantBorder
                )}
                fillOpacity={0}
                stroke={theme.colors.border}
                strokeWidth={staticProps.quadrantBorder}
                strokeOpacity={transition.strokeOpacity}
            />
            <QuadrantLabel
                x={transition.textX}
                y={transition.textY}
                textAnchor="middle"
                alignmentBaseline="central"
            >
                {label}
            </QuadrantLabel>
        </>
    )
}

const QuadrantOutline = styled(animated.rect)`
    pointer-events: none;
`

const QuadrantLabel = styled(animated.text)`
    color: #e3d8c4;
    fill: #e3d8c4;
    text-transform: uppercase;
    letter-spacing: 3px;
    opacity: 0.75;
    font-size: ${({ theme }) => theme.typography.size.larger};
    user-select: none;
    pointer-events: none;
`
