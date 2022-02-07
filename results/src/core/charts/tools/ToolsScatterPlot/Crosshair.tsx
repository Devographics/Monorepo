import React from 'react'
import styled, { useTheme } from 'styled-components'
import { LayerProps } from './types'
import { crosshair } from './config'
import { useToolsScatterPlotContext } from './state'

export const Crosshair = ({ nodes, innerHeight }: LayerProps) => {
    const theme = useTheme()

    const { currentTool } = useToolsScatterPlotContext()
    const node = currentTool !== null ? nodes.find(node => node.data.originalId === currentTool) : undefined

    if (!node) return null

    return (
        <Group>
            <line
                className="Scatterplot__Crosshair__Line"
                y1={node.y}
                x2={node.x - crosshair.circleRadius}
                y2={node.y}
                stroke={theme.colors.border}
                strokeWidth={3}
            />
            <line
                className="Scatterplot__Crosshair__Line"
                x1={node.x}
                y1={innerHeight}
                x2={node.x}
                y2={node.y + crosshair.circleRadius}
                stroke={theme.colors.border}
                strokeWidth={3}
            />
            <g transform={`translate(0,${node.y})`}>
                <rect
                    x={-crosshair.labelWidth}
                    y={-crosshair.labelHeight / 2}
                    width={crosshair.labelWidth}
                    height={crosshair.labelHeight}
                    rx={2}
                    ry={2}
                    fill={theme.colors.backgroundInverted}
                />
                <Label
                    className="Scatterplot__Crosshair__Label"
                    x={crosshair.labelWidth * -.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {node.formattedY}
                </Label>
            </g>
            <g transform={`translate(${node.x},${innerHeight})`}>
                <rect
                    x={-crosshair.labelWidth / 2}
                    width={crosshair.labelWidth}
                    height={crosshair.labelHeight}
                    rx={2}
                    ry={2}
                    fill={theme.colors.backgroundInverted}
                />
                <Label
                    className="Scatterplot__Crosshair__Label"
                    y={crosshair.labelHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {node.formattedX}
                </Label>
            </g>
            <g transform={`translate(${node.x},${node.y})`}>
                <circle
                    r={crosshair.circleRadius}
                    strokeWidth={3}
                    stroke={theme.colors.border}
                    fill="none"
                />
            </g>
        </Group>
    )
}

const Group = styled.g`
    pointer-events: none;
`

const Label = styled.text`
    font-size: ${({ theme }) => theme.typography.size.small};
`
