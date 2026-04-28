import React from 'react'
import styled, { useTheme } from 'styled-components'
import { NodeData } from './types'
import { staticProps, crosshair } from './config'
import { ScatterplotChartState } from './chartState'

type NodeProps = {
    chartState: ScatterplotChartState
    node: NodeData
}

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
            <circle r={staticProps.nodeCaptureRadius} fill="red" opacity={0} />
            <circle r={staticProps.nodeRadius} fill={color} />
            <LabelGroup
                opacity={labelOpacity}
                // transform={to(
                //     [transition.labelOffset],
                //     (labelOffset: number) => `translate(${12 + labelOffset},${1})`
                // )}
            >
                <LabelRect
                    x={20}
                    y={crosshair.labelHeight * -0.5}
                    width={label && label.length * 8 + 12}
                    // matching the crosshair height are they're aligned on the y axis
                    height={crosshair.labelHeight}
                    rx={2}
                    ry={2}
                    opacity={labelBackgroundOpacity}
                />
                <LabelText
                    x={26}
                    $isHover={isCurrentItem}
                    alignmentBaseline="middle"
                    fill={theme.colors.text}
                >
                    {label}
                </LabelText>
            </LabelGroup>
        </g>
    )
}

const LabelGroup = styled.g`
    pointer-events: none;
`

const LabelRect = styled.rect`
    fill: ${({ theme }) => theme.colors.backgroundInverted};
`

const LabelText = styled.text<{
    $isHover: boolean
}>`
    fill: ${({ $isHover, theme }) => ($isHover ? theme.colors.textInverted : theme.colors.text)};
    font-size: ${({ theme }) => theme.typography.size.small};
    font-weight: ${({ $isHover, theme }) =>
        $isHover ? theme.typography.weight.medium : theme.typography.weight.light};
`
