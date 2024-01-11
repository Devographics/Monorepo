import React, { createContext, useCallback, useContext, useMemo, MouseEvent } from 'react'
import { animated, config as springConfig, SpringValues, useSprings } from '@react-spring/web'
import styled, { useTheme } from 'styled-components'
import truncate from 'lodash/truncate'
import { useTooltip } from '@nivo/tooltip'
import { ResponsiveCirclePacking, ComputedDatum } from '@nivo/circle-packing'
// @ts-ignore: no typings yet for this
import ChartLabel from 'core/components/ChartLabel'
// @ts-ignore: no typings yet for this
import { FeaturesCirclePackingChartTooltip } from './FeaturesCirclePackingChartTooltip'
import { Entity } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'

const LABEL_FONT_SIZE = 12
const GRID_COLUMNS = 8
const GRID_SPACING = 110
const SPRING_CONFIG = springConfig.gentle
const CHART_MARGIN = {
    top: 2,
    right: 2,
    bottom: 2,
    left: 2
}

interface FeatureNodeData {
    // technical identifier, i.e. aspect_ratio
    id: string
    // translated name, i.e. CSS property: aspect-ratio
    name: string
    sectionId: string
    index: number
    awareness: number
    awareness_rank: number
    usage: number
    usage_rank: number
    usage_ratio: number
    usage_ratio_rank: number
    unused_count: number
    entity?: Entity
}

interface SectionNodeData {
    // technical identifier, i.e. shapes_graphics
    id: string
    // translated name, i.e. Shapes & Graphics
    name: string
    // always true
    isSection: true
    children: FeatureNodeData[]
}

interface RootNodeData {
    id: 'root'
    children: SectionNodeData[]
}

type NodeData = FeatureNodeData | SectionNodeData | RootNodeData

type ChartMode = 'grouped' | 'awareness_rank' | 'usage_rank'

const isSectionNode = (node: NodeData): node is SectionNodeData =>
    (node as SectionNodeData).isSection

const isFeatureNode = (node: NodeData): node is FeatureNodeData =>
    node.id !== 'root' && !isSectionNode(node)

const ChartContext = createContext<{
    mode: ChartMode
    currentFeatureIds: null | string[]
}>({
    mode: 'grouped',
    currentFeatureIds: null
})

const sectionContainsOneOfFeatures = (sectionNode: SectionNodeData, featureIds: string[]) =>
    sectionNode.children.some(node => featureIds.includes(node.id))

const getSectionNodeOpacity = (
    node: SectionNodeData,
    mode: ChartMode,
    currentFeatureIds: null | string[]
) => {
    if (mode !== 'grouped') return 0
    if (currentFeatureIds === null) return 1
    return sectionContainsOneOfFeatures(node, currentFeatureIds) ? 1 : 0.15
}

// Compute node x/y for alternative grid layouts.
const getGridCoords = (rank: number) => ({
    x: 80 + (rank % GRID_COLUMNS) * GRID_SPACING,
    y: 100 + Math.floor(rank / GRID_COLUMNS) * GRID_SPACING
})

const SectionNode = ({
    node,
    springValues: { opacity, radius }
}: {
    node: ComputedDatum<SectionNodeData>
    springValues: SpringValues<{
        opacity: number
        radius: number
    }>
}) => {
    const theme = useTheme()
    // @ts-ignore: sections depend on the survey, and we didn't solved this issue
    const color = theme.colors.ranges.features_categories[node.data.id]

    return (
        <animated.g
            key={node.data.id}
            transform={`translate(${node.x},${node.y})`}
            opacity={opacity}
        >
            <animated.circle
                r={radius}
                fill={theme.colors.backgroundAlt}
                fillOpacity={0.4}
                stroke={color}
                strokeWidth={1}
                strokeLinecap="round"
                strokeDasharray="2 3"
            />
        </animated.g>
    )
}

const SectionNodes = ({
    nodes,
    mode,
    currentFeatureIds
}: {
    nodes: ComputedDatum<SectionNodeData>[]
    mode: ChartMode
    currentFeatureIds: null | string[]
}) => {
    const springs = useSprings<{
        opacity: number
        radius: number
    }>(
        nodes.length,
        nodes.map(node => ({
            opacity: getSectionNodeOpacity(node.data, mode, currentFeatureIds),
            radius: mode === 'grouped' ? node.radius : node.radius * 0.6,
            config: SPRING_CONFIG
        }))
    )

    return (
        <>
            {springs.map((springValues, i) => (
                <SectionNode key={nodes[i].data.id} node={nodes[i]} springValues={springValues} />
            ))}
        </>
    )
}

const FeatureNode = ({
    node,
    mode,
    springValues
}: {
    node: ComputedDatum<FeatureNodeData>
    mode: ChartMode
    springValues: SpringValues<{
        transform: string
        opacity: number
    }>
}) => {
    const { getString } = useI18n()
    const theme = useTheme()
    // @ts-ignore: sections depend on the survey, and we didn't solved this issue
    const color = theme.colors.ranges.features_categories[node.data.sectionId]

    const offset = mode === 'grouped' ? 0 : 50
    const radius = node.radius
    const usageRadius = radius * (node.data.usage / node.data.awareness)

    const { showTooltipFromEvent, hideTooltip } = useTooltip()
    const tooltip = useMemo(() => <FeaturesCirclePackingChartTooltip node={node.data} />, [node])
    const handleTooltip = useCallback(
        (event: MouseEvent) => showTooltipFromEvent(tooltip, event),
        [showTooltipFromEvent, tooltip]
    )
    const handleMouseLeave = useCallback(hideTooltip, [hideTooltip])

    const tString = getString(`features.${node.data.id}`)
    const translatedName = tString?.tClean || tString.t
    const entityName = node.data.entity?.nameClean || node.data.entity?.name
    const label = translatedName || entityName

    return (
        <animated.g
            key={node.data.id}
            transform={springValues.transform}
            opacity={springValues.opacity}
            onMouseEnter={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={handleMouseLeave}
        >
            <circle r={radius} fill={`${color}50`} />
            <circle r={usageRadius} fill={color} />
            <ChartLabel
                transform={`translate(0,${offset})`}
                label={truncate(label, { length: 12, omission: '…' })}
                fontSize={LABEL_FONT_SIZE}
            />
        </animated.g>
    )
}

const FeatureNodes = ({
    nodes: _nodes,
    mode,
    currentFeatureIds
}: {
    nodes: ComputedDatum<FeatureNodeData>[]
    mode: ChartMode
    currentFeatureIds: null | string[]
}) => {
    // adjust positions for grid mode
    const nodes = useMemo(() => {
        if (mode === 'grouped') return _nodes
        return _nodes.map(node => ({
            ...node,
            ...getGridCoords(node.data[mode])
        }))
    }, [_nodes, mode])

    const springs = useSprings<{
        transform: string
        opacity: number
    }>(
        nodes.length,
        nodes.map(node => ({
            transform: `translate(${node.x},${node.y})`,
            opacity:
                currentFeatureIds === null || currentFeatureIds.includes(node.data.id) ? 1 : 0.15,
            config: SPRING_CONFIG
        }))
    )

    return (
        <>
            {springs.map((springValues, i) => (
                <FeatureNode
                    key={nodes[i].data.id}
                    node={nodes[i]}
                    mode={mode}
                    springValues={springValues}
                />
            ))}
        </>
    )
}

// As our implementation is quite custom, we only use the nivo
// chart to handle computing the actual circle packing,
// but we also support extra grid views.
const NodesLayer = ({ nodes }: { nodes: ComputedDatum<NodeData>[] }) => {
    const { mode, currentFeatureIds } = useContext(ChartContext)
    const [sectionNodes, featureNodes] = useMemo(
        () => [
            nodes.filter(node => isSectionNode(node.data)) as ComputedDatum<SectionNodeData>[],
            nodes.filter(node => isFeatureNode(node.data)) as ComputedDatum<FeatureNodeData>[]
        ],
        [nodes]
    )

    return (
        <>
            <SectionNodes nodes={sectionNodes} mode={mode} currentFeatureIds={currentFeatureIds} />
            <FeatureNodes nodes={featureNodes} mode={mode} currentFeatureIds={currentFeatureIds} />
        </>
    )
}

export const FeaturesCirclePackingChart = ({
    data,
    className,
    currentFeatureIds = null,
    mode
}: {
    data: RootNodeData
    className: string
    // for the "story-telling" mode, contains a list of feature ids.
    currentFeatureIds?: null | string[]
    mode: ChartMode
}) => {
    const theme = useTheme()

    return (
        <Chart className={`CirclePackingChart ${className}`}>
            <ChartContext.Provider value={{ mode, currentFeatureIds }}>
                <ResponsiveCirclePacking<NodeData>
                    data={data}
                    value="awareness"
                    margin={CHART_MARGIN}
                    leavesOnly={false}
                    padding={5}
                    theme={theme.charts}
                    enableLabels={false}
                    animate={false}
                    layers={[NodesLayer]}
                />
            </ChartContext.Provider>
        </Chart>
    )
}

const Chart = styled.div`
    svg {
        overflow: visible;
    }
`
