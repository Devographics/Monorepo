import React from 'react'
import { useTheme } from 'styled-components'
import { NodeData } from './types'
import { ScatterplotChartState } from './chartState'
import { crosshairConfig } from './Crosshair'
import './Node.scss'

type NodeProps = {
    chartState: ScatterplotChartState
    node: NodeData
}

const nodeRadius = 7
const nodeCaptureRadius = 16
const lowOpacity = 0.2
const highOpacity = 1

export const Node = ({ chartState, node }: NodeProps) => {
    const theme = useTheme()
    const { currentItem, setCurrentItem, highlighted, zoomedQuadrantIndex } = chartState
    const { id, color, label, x, y, isCurrentItem, isHighlighted } = node
    const hasZoom = zoomedQuadrantIndex !== null

    let opacity = highOpacity
    const hasCurrentCategory = highlighted !== null
    const hasCurrentItem = currentItem !== null

    if ((hasCurrentCategory && !isHighlighted) || (hasCurrentItem && !isCurrentItem)) {
        opacity = lowOpacity
    }

    const labelOpacity = hasZoom || isCurrentItem || isHighlighted ? 1 : 0.2
    const labelOffset = isCurrentItem ? 16 : 0
    const labelBackgroundOpacity = isCurrentItem ? 1 : 0

    return (
        <g
            data-id={id}
            className="scatterplot-node"
            onMouseEnter={() => {
                setCurrentItem(id)
            }}
            onMouseLeave={() => {
                setCurrentItem(null)
            }}
            transform={`translate(${x},${y})`}
            opacity={opacity}
        >
            <circle r={nodeCaptureRadius} fill="red" opacity={0} />
            <circle r={nodeRadius} fill={color} />
            <g
                className={`scatterplot-node-label scatterplot-node-label-${
                    isCurrentItem ? 'hover' : ''
                }`}
                opacity={labelOpacity}
                // transform={to(
                //     [transition.labelOffset],
                //     (labelOffset: number) => `translate(${12 + labelOffset},${1})`
                // )}
            >
                <rect
                    className="scatterplot-node-label-rect"
                    x={20}
                    y={crosshairConfig.labelHeight * -0.5}
                    width={label && label.length * 8 + 12}
                    // matching the crosshair height are they're aligned on the y axis
                    height={crosshairConfig.labelHeight}
                    rx={2}
                    ry={2}
                    opacity={labelBackgroundOpacity}
                />
                <text className="scatterplot-node-label-text" x={26} alignmentBaseline="middle">
                    {label}
                </text>
            </g>
        </g>
    )
}
