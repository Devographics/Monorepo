import React from 'react'
import { NodeData } from './types'
import { ScatterplotChartState } from '../scatterplot/chartState'
import { crosshairConfig } from './Crosshair'
import './Node.scss'

const nodeRadius = 7
const nodeCaptureRadius = 16
const lowOpacity = 0.2
const highOpacity = 1

// how much a node (marker or label) is dimmed when another node is
// hovered/highlighted
const getNodeOpacity = (chartState: ScatterplotChartState, node: NodeData) => {
    const { currentItem, highlighted } = chartState
    const { isCurrentItem, isHighlighted } = node
    const hasCurrentCategory = highlighted !== null
    const hasCurrentItem = currentItem !== null
    if ((hasCurrentCategory && !isHighlighted) || (hasCurrentItem && !isCurrentItem)) {
        return lowOpacity
    }
    return highOpacity
}

type NodeMarkerProps = {
    chartState: ScatterplotChartState
    node: NodeData
}

export const NodeMarker = ({ chartState, node }: NodeMarkerProps) => {
    const { setCurrentItem } = chartState
    const { id, color, x, y } = node

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
            opacity={getNodeOpacity(chartState, node)}
        >
            <circle r={nodeCaptureRadius} fill="red" opacity={0} />
            <circle r={nodeRadius} fill={color} />
        </g>
    )
}

type NodeLabelProps = {
    chartState: ScatterplotChartState
    node: NodeData
    // false when the label lost a collision and should stay hidden until interacted with
    labelVisibleByDefault?: boolean
}

export const NodeLabel = ({ chartState, node, labelVisibleByDefault = true }: NodeLabelProps) => {
    const { zoomedQuadrantIndex } = chartState
    const { label, x, y, isCurrentItem, isHighlighted } = node
    const hasZoom = zoomedQuadrantIndex !== null

    const labelIsForced = hasZoom || isCurrentItem || isHighlighted
    const labelOpacity = labelIsForced ? 1 : labelVisibleByDefault ? 0.5 : 0
    const labelBackgroundOpacity = isCurrentItem ? 1 : 0

    // keep the label dimmed in sync with its marker when another node is active
    const opacity = getNodeOpacity(chartState, node) * labelOpacity

    return (
        <g
            className={`scatterplot-node-label scatterplot-node-label-${
                isCurrentItem ? 'hover' : ''
            }`}
            transform={`translate(${x},${y})`}
            opacity={opacity}
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
    )
}
