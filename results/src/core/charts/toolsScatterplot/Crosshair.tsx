import React from 'react'
import { useTheme } from 'styled-components'
import { ScatterplotChartState } from './chartState'
import { ScatterplotChartValues } from './chartValues'
import { NodeData } from './types'
import './Crosshair.scss'

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
        <g className="scatterplot-crosshair-group">
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
                <text
                    className="scatterplot-crosshair-label"
                    x={crosshairConfig.labelWidth * -0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {node.formattedY}
                </text>
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
                <text
                    className="scatterplot-crosshair-label"
                    y={crosshairConfig.labelHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {node.formattedX}
                </text>
            </g>
            <g transform={`translate(${node.x},${node.y})`}>
                <circle
                    r={crosshairConfig.circleRadius}
                    strokeWidth={3}
                    stroke={theme.colors.border}
                    fill="none"
                />
            </g>
        </g>
    )
}
