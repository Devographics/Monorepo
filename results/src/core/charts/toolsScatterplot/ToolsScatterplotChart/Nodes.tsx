import React, { useMemo } from 'react'
import { useTransition, SpringValues } from '@react-spring/web'
import { useMotionConfig } from '@nivo/core'
import { ChartLayerProps, NodeData, NodeAnimatedProps } from '../types'
import { Node } from './Node'
import { useToolsQuadrantsChartContext } from './state'
import { useToolSections } from 'core/helpers/metadata'
import { QuestionMetadata, SectionMetadata } from '@devographics/types'

export const Nodes = ({ nodes: _nodes, innerWidth, innerHeight }: ChartLayerProps) => {
    const { currentCategory, currentTool, zoomedQuadrantIndex } = useToolsQuadrantsChartContext()
    const toolSections = useToolSections()
    const nodes: NodeData[] = useMemo(() => {
        const hasCurrentCategory = currentCategory !== null
        const hasCurrentTool = currentTool !== null
        const hasZoom = zoomedQuadrantIndex !== null

        return _nodes.map(node => {
            let opacity = 1
            if (hasCurrentTool) {
                opacity = currentTool === node.data.id ? 1 : 0.2
            }
            if (hasCurrentCategory) {
                opacity = toolSections
                    .find((s: SectionMetadata) => s.id === currentCategory)
                    .questions.find((q: QuestionMetadata) => q.id === node.data.id)
                    ? 1
                    : 0.2
            }

            const isHover = hasCurrentTool && currentTool === node.data.id

            return {
                id: node.data.id,
                categoryId: node.serieId as string,
                name: node.data.name,
                x: node.x,
                y: node.y,
                color: node.color,
                opacity,
                isHover: hasCurrentTool && currentTool === node.data.id,
                labelOpacity: hasZoom || isHover ? 1 : 0,
                labelOffset: isHover ? 16 : 0,
                labelBackgroundOpacity: isHover ? 1 : 0
            }
        })
    }, [_nodes, currentCategory, currentTool, zoomedQuadrantIndex])

    const { animate, config: springConfig } = useMotionConfig()
    const transitions = useTransition<NodeData, NodeAnimatedProps>(nodes, {
        keys: (node: NodeData) => node.id,
        from: (node: NodeData) => ({
            x: node.x,
            y: node.y,
            opacity: node.opacity,
            labelOpacity: node.labelOpacity,
            labelOffset: node.labelOffset,
            labelBackgroundOpacity: node.labelBackgroundOpacity
        }),
        update: (node: NodeData) => ({
            x: node.x,
            y: node.y,
            opacity: node.opacity,
            labelOpacity: node.labelOpacity,
            labelOffset: node.labelOffset,
            labelBackgroundOpacity: node.labelBackgroundOpacity
        }),
        config: springConfig,
        immediate: !animate
    })

    return (
        <>
            <mask id="quadrantsNodesMask">
                <rect width={innerWidth} height={innerHeight} fill="white" />
            </mask>
            <g mask="url(#quadrantsNodesMask)">
                {transitions((transition: SpringValues<NodeAnimatedProps>, node: NodeData) => (
                    <Node
                        key={node.id}
                        id={node.id}
                        name={node.name}
                        categoryId={node.categoryId}
                        x={node.x}
                        y={node.y}
                        color={node.color}
                        opacity={node.opacity}
                        isHover={node.isHover}
                        labelOpacity={node.labelOpacity}
                        labelOffset={node.labelOffset}
                        labelBackgroundOpacity={node.labelBackgroundOpacity}
                        transition={transition}
                    />
                ))}
            </g>
        </>
    )
}
