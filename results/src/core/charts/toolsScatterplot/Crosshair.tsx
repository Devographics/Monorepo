import React from 'react'
import styled, { useTheme } from 'styled-components'
import { ScatterplotChartState } from './chartState'
import { ScatterplotChartValues } from './chartValues'
import { NodeData } from './types'

export const crosshairConfig = {
    labelWidth: 70,
    labelHeight: 24,
    circleRadius: 14
}

type CrossHairProps = {
    chartState: ScatterplotChartState
    chartValues: ScatterplotChartValues
    nodes: NodeData[]
    innerHeight: number
}

export const Crosshair = ({ chartState, nodes, innerHeight }: CrossHairProps) => {
    const theme = useTheme()

    const { currentItem } = chartState
    const node = currentItem !== null ? nodes.find(node => node.id === currentItem) : undefined

    if (!node) return null

    return (
        <Group>
            <line
                className="Scatterplot__Crosshair__Line"
                y1={node.y}
                x2={node.x - crosshairConfig.circleRadius}
                y2={node.y}
                stroke={theme.colors.border}
                strokeWidth={3}
            />
            <line
                className="Scatterplot__Crosshair__Line"
                x1={node.x}
                y1={innerHeight}
                x2={node.x}
                y2={node.y + crosshairConfig.circleRadius}
                stroke={theme.colors.border}
                strokeWidth={3}
            />
            <g transform={`translate(0,${node.y})`}>
                <rect
                    x={-crosshairConfig.labelWidth}
                    y={-crosshairConfig.labelHeight / 2}
                    width={crosshairConfig.labelWidth}
                    height={crosshairConfig.labelHeight}
                    rx={2}
                    ry={2}
                    fill={theme.colors.backgroundInverted}
                />
                <Label
                    className="Scatterplot__Crosshair__Label"
                    x={crosshairConfig.labelWidth * -0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {node.formattedY}
                </Label>
            </g>
            <g transform={`translate(${node.x},${innerHeight + 8})`}>
                <rect
                    x={-crosshairConfig.labelWidth / 2}
                    width={crosshairConfig.labelWidth}
                    height={crosshairConfig.labelHeight}
                    rx={2}
                    ry={2}
                    fill={theme.colors.backgroundInverted}
                />
                <Label
                    className="Scatterplot__Crosshair__Label"
                    y={crosshairConfig.labelHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {node.formattedX}
                </Label>
            </g>
            <g transform={`translate(${node.x},${node.y})`}>
                <circle
                    r={crosshairConfig.circleRadius}
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
