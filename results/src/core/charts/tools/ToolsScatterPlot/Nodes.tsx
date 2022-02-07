import React, { useMemo } from 'react'
import { useTransition } from '@react-spring/web'
import { useMotionConfig } from '@nivo/core'
// @ts-ignore: we don't have typings for the variables
import variables from 'Config/variables.yml'
import { LayerProps, NodeData, NodeAnimatedProps } from './types'
import { Node } from './Node'
import { useToolsScatterPlotContext } from './state'

const { toolsCategories } = variables

export const Nodes = ({
    nodes: _nodes,
    innerWidth,
    innerHeight,
}: LayerProps) => {
    const {
        metric,
        currentCategory,
        currentTool,
        zoomedQuadrantIndex,
    } = useToolsScatterPlotContext()

    const nodes: NodeData[] = useMemo(() => {
        const hasCurrentCategory = currentCategory !== null
        const hasCurrentTool = currentTool !== null
        const hasZoom = zoomedQuadrantIndex !== null

        return _nodes.map(node => {
            let opacity = 1
            if (hasCurrentTool) {
                opacity = currentTool === node.data.originalId ? 1 : .2
            }
            if (hasCurrentCategory) {
                opacity = toolsCategories[currentCategory].includes(node.data.originalId) ? 1 : .2
            }

            const isHover = hasCurrentTool && currentTool === node.data.originalId

            return {
                id: node.data.originalId,
                categoryId: node.serieId as string,
                name: node.data.name,
                x: node.x,
                y: node.y,
                color: node.color,
                opacity,
                isHover: hasCurrentTool && currentTool === node.data.originalId,
                labelOpacity: (hasZoom || isHover) ? 1 : 0,
                labelOffset: isHover ? 16 : 0,
                labelBackgroundOpacity: isHover ? 1 : 0,
            }
        })
    }, [_nodes, metric, currentCategory, currentTool, zoomedQuadrantIndex])

    const { animate, config: springConfig } = useMotionConfig()
    const transitions = useTransition<NodeData, NodeAnimatedProps>(nodes, {
        keys: node => node.id,
        from: node => ({
            x: node.x,
            y: node.y,
            opacity: node.opacity,
            labelOpacity: node.labelOpacity,
            labelOffset: node.labelOffset,
            labelBackgroundOpacity: node.labelBackgroundOpacity,
        }),
        update: node => ({
            x: node.x,
            y: node.y,
            opacity: node.opacity,
            labelOpacity: node.labelOpacity,
            labelOffset: node.labelOffset,
            labelBackgroundOpacity: node.labelBackgroundOpacity,
        }),
        config: springConfig,
        immediate: !animate,
    })

    return (
        <>
            <mask id="quadrantsNodesMask">
                <rect
                    width={innerWidth}
                    height={innerHeight}
                    fill="white"
                />
            </mask>
            <g mask="url(#quadrantsNodesMask)">
                {transitions((transition, node) => (
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
