import React, { useMemo } from 'react'
import { NodeData } from './types'
import { NodeMarker, NodeLabel } from './Node'
import { ScatterplotChartState } from '../scatterplot/chartState'
import { crosshairConfig } from './Crosshair'

type NodesProps = {
    chartState: ScatterplotChartState
    nodes: NodeData[]
}

// label geometry, kept in sync with the <rect>/<text> in Node.tsx:
// the label box starts 20px to the right of the node and is one crosshair-label tall
const labelPaddingX = 20
const labelCharWidth = 8
const labelExtraWidth = 12
const labelHeight = crosshairConfig.labelHeight

type Rect = { left: number; right: number; top: number; bottom: number }

const getLabelRect = (node: NodeData): Rect => {
    const width = (node.label?.length ?? 0) * labelCharWidth + labelExtraWidth
    return {
        left: node.x + labelPaddingX,
        right: node.x + labelPaddingX + width,
        top: node.y - labelHeight / 2,
        bottom: node.y + labelHeight / 2
    }
}

const overlaps = (a: Rect, b: Rect) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

// greedily accept labels from top to bottom, skipping any that would overlap
// one already placed. Returns the ids whose label should show by default;
// the rest stay hidden until hovered/highlighted/zoomed.
const getVisibleLabelIds = (nodes: NodeData[]): Set<string> => {
    const placed: Rect[] = []
    const visibleIds = new Set<string>()
    const sorted = [...nodes].sort((a, b) => a.y - b.y)
    for (const node of sorted) {
        if (!node.label) continue
        const rect = getLabelRect(node)
        if (placed.some(other => overlaps(other, rect))) continue
        placed.push(rect)
        visibleIds.add(node.id)
    }
    return visibleIds
}

export const Nodes = ({ chartState, nodes }: NodesProps) => {
    const visibleLabelIds = useMemo(() => getVisibleLabelIds(nodes), [nodes])

    return (
        <g>
            {/* markers first, then labels, so every label stacks above every point */}
            <g className="scatterplot-node-markers">
                {nodes.map(node => (
                    <NodeMarker key={node.id} chartState={chartState} node={node} />
                ))}
            </g>
            <g className="scatterplot-node-labels">
                {nodes.map(node => (
                    <NodeLabel
                        key={node.id}
                        chartState={chartState}
                        node={node}
                        labelVisibleByDefault={visibleLabelIds.has(node.id)}
                    />
                ))}
            </g>
        </g>
    )
}
