import React from 'react'
import { NodeData } from './types'
import { Node } from './Node'
import { ScatterplotChartState } from './chartState'
import { ScatterplotChartValues } from './chartValues'

type NodesProps = {
    chartState: ScatterplotChartState
    chartValues: ScatterplotChartValues
    nodes: NodeData[]
    innerWidth: number
    innerHeight: number
}

export const Nodes = ({ chartState, chartValues, nodes, innerWidth, innerHeight }: NodesProps) => {
    return (
        <g>
            {nodes.map(node => (
                <Node key={node.id} chartState={chartState} node={node} />
            ))}
        </g>
    )
}
