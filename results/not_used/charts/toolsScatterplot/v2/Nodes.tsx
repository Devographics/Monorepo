import React from 'react'
import { NodeData } from './types'
import { Node } from './Node'
import { QuestionMetadata, SectionMetadata, StandardQuestionData } from '@devographics/types'
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
        <>
            {/* <mask id="quadrantsNodesMask">
                <rect width={innerWidth} height={innerHeight} fill="white" />
            </mask> */}
            <g mask="url(#quadrantsNodesMask)">
                {nodes.map(node => (
                    <Node key={node.id} chartState={chartState} node={node} />
                ))}
            </g>
        </>
    )
}
