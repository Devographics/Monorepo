import React, { memo, useCallback } from 'react'
import styled, { useTheme } from 'styled-components'
import { animated, SpringValues, to } from '@react-spring/web'
import { NodeData, NodeAnimatedProps } from '../types'
import { useToolsQuadrantsChartContext } from './state'
import { staticProps, forcedLabelPositions, crosshair } from './config'

const NonMemoizedNode = ({
    id,
    name,
    color,
    transition,
    isHover,
}: NodeData & {
    transition: SpringValues<NodeAnimatedProps>
}) => {
    const theme = useTheme()
    const {
        metric,
        setCurrentTool,
    } = useToolsQuadrantsChartContext()

    const translateLabel = forcedLabelPositions[metric][name] ?? [0, 0]

    const handleMouseEnter = useCallback(() => {
        setCurrentTool(id)
    }, [setCurrentTool, id])

    const handleMouseLeave = useCallback(() => {
        setCurrentTool(null)
    }, [setCurrentTool])

    return (
        <animated.g
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            transform={to([transition.x, transition.y], (x, y) => `translate(${x},${y})`)}
            opacity={transition.opacity}
        >
            <circle
                r={staticProps.nodeCaptureRadius}
                fill="red"
                opacity={0}
            />
            <circle
                r={staticProps.nodeRadius}
                fill={color}
            />
            <LabelGroup
                opacity={transition.labelOpacity}
                transform={to(
                    [transition.labelOffset],
                    (labelOffset) => `translate(${12 + translateLabel[0] + labelOffset},${1 + translateLabel[1]})`
                )}
            >
                <LabelRect
                    x={-6}
                    y={crosshair.labelHeight * -.5}
                    width={name && name.length * 8 + 12}
                    // matching the crosshair height are they're aligned on the y axis
                    height={crosshair.labelHeight}
                    rx={2}
                    ry={2}
                    opacity={transition.labelBackgroundOpacity}
                />
                <LabelText
                    $isHover={isHover}
                    alignmentBaseline="middle"
                    fill={theme.colors.text}
                >
                    {name}
                </LabelText>
            </LabelGroup>
        </animated.g>
    )
}

const LabelGroup = styled(animated.g)`
    pointer-events: none;
`

const LabelRect = styled(animated.rect)`
    fill: ${({ theme }) => theme.colors.backgroundInverted};
`

const LabelText = styled.text<{
    $isHover: boolean
}>`
    fill: ${({ $isHover, theme }) => $isHover ? theme.colors.textInverted : theme.colors.text};
    font-size: ${({ theme }) => theme.typography.size.small};
    font-weight: ${({ $isHover, theme }) => $isHover ? theme.typography.weight.medium : theme.typography.weight.light};
`

export const Node = memo(NonMemoizedNode)
