import React, { memo } from 'react'
import styled, { css, useTheme } from 'styled-components'
import PropTypes from 'prop-types'
import { ResponsiveCirclePacking, useNodeMouseHandlers } from '@nivo/circle-packing'
import ChartLabel from 'core/components/ChartLabel'
import { FeaturesCirclePackingChartTooltip } from './FeaturesCirclePackingChartTooltip'

const fontSizeByRadius = (radius) => {
    if (radius < 25) return 8
    if (radius < 35) return 10
    if (radius < 45) return 12
    return 14
}

const sectionLabelOffsets = {
    layout: 75,
    shapes_graphics: 320,
    interactions: 100,
    typography: 320,
    animations_transforms: 50,
    media_queries: 0,
    other_features: 135,
}

const Node = (props) => {
    // note that `current` is an array of ids for this chart
    const { node, current } = props
    const radius = node.radius
    const theme = useTheme()

    const handlers = useNodeMouseHandlers(node, {
        onMouseEnter: props.onMouseEnter,
        onMouseMove: props.onMouseMove,
        onMouseLeave: props.onMouseLeave,
    })

    if (node.depth === 0) {
        return null
    }

    if (node.depth === 1 && node.data.isSection) {
        const color = theme.colors.ranges.featureSections[node.data.id]

        const categoryContainsIds = (categoryNode, itemIds) => {
            return categoryNode.data.children.some((node) => itemIds.includes(node.id))
        }

        const state =
            current === null
                ? 'default'
                : categoryContainsIds(node, current)
                ? 'active'
                : 'inactive'

        return (
            <CirclePackingNodeCategory state={state} transform={`translate(${node.x},${node.y})`}>
                <defs>
                    <path
                        d={`M-${radius},0a${radius},${radius} 0 1,0 ${
                            radius * 2
                        },0a${radius},${radius} 0 1,0 -${radius * 2},0`}
                        id={`textcircle-${node.data.id}`}
                    />
                </defs>
                <CirclePackingNodeCategoryLabel dy={30}>
                    <textPath
                        xlinkHref={`#textcircle-${node.data.id}`}
                        side="right"
                        fill={color}
                        style={{
                            fontWeight: '600',
                            fontSize: '0.9rem',
                        }}
                        startOffset={sectionLabelOffsets[node.data.id]}
                    >
                        {node.data.name}
                    </textPath>
                </CirclePackingNodeCategoryLabel>
                <circle
                    r={radius}
                    fill={theme.colors.backgroundAlt}
                    fillOpacity={0.4}
                    stroke={color}
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeDasharray="2 3"
                />
            </CirclePackingNodeCategory>
        )
    } else {
        const usageRadius = radius * (node.data.usage / node.data.awareness)
        const color = theme.colors.ranges.featureSections[node.data.sectionId]

        const state =
            current === null ? 'default' : current.includes(node.data.id) ? 'active' : 'inactive'

        const offset = node.data.index % 2 === 0 ? -6 : 6

        return (
            <CirclePackingNode
                className="CirclePackingNode"
                transform={`translate(${node.x},${node.y})`}
                onMouseEnter={handlers.onMouseEnter}
                onMouseMove={handlers.onMouseMove}
                onMouseLeave={handlers.onMouseLeave}
                state={state}
            >
                <circle r={radius} fill={`${color}50`} />
                <circle r={usageRadius} fill={color} />
                <ChartLabel
                    transform={`translate(0,${offset})`}
                    label={node.data.name}
                    fontSize={fontSizeByRadius(radius)}
                />
            </CirclePackingNode>
        )
    }
}

const FeaturesCirclePackingChart = ({ data, className, current = null }) => {
    const theme = useTheme()

    return (
        <Chart className={`CirclePackingChart ${className}`}>
            <ResponsiveCirclePacking
                theme={theme.charts}
                margin={{
                    top: 2,
                    right: 2,
                    bottom: 2,
                    left: 2,
                }}
                identity="name"
                leavesOnly={false}
                padding={5}
                colors={['white', 'blue']}
                data={data}
                value="awareness"
                circleComponent={(props) => <Node {...props} current={current} />}
                animate={false}
                tooltip={FeaturesCirclePackingChartTooltip}
            />
        </Chart>
    )
}

FeaturesCirclePackingChart.propTypes = {
    data: PropTypes.shape({
        features: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                usage: PropTypes.shape({
                    total: PropTypes.number.isRequired,
                    buckets: PropTypes.arrayOf(
                        PropTypes.shape({
                            id: PropTypes.string.isRequired,
                            count: PropTypes.number.isRequired,
                            percentage: PropTypes.number.isRequired,
                        })
                    ).isRequired,
                }).isRequired,
            })
        ),
    }),
}

const Chart = styled.div`
    svg {
        overflow: visible;
    }
`
const CirclePackingNodeCategory = styled.g`
    ${({ state }) =>
        css`
            opacity: ${state === 'inactive' ? 0.15 : 1};
        `}
`

const CirclePackingNode = styled.g`
    &.CirclePackingNode--inactive {
        opacity: 0.15;
    }
    ${({ state }) =>
        css`
            opacity: ${state === 'inactive' ? 0.15 : 1};
        `}
`

const CirclePackingNodeCategoryLabel = styled.text`
    fill: ${({ theme }) => theme.colors.link};
    opacity: 0.65;
`

export default memo(FeaturesCirclePackingChart)
