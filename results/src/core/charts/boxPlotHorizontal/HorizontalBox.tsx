import React from 'react'
import styled from 'styled-components'
import { useTheme } from '@nivo/core'
import { BoxProps } from '../boxPlotVertical/VerticalBox'
const STROKE_WIDTH = 1
import { Tooltip } from 'react-svg-tooltip'
import BarTooltip from '../common/BarTooltip'
// import { TooltipContent_, getTooltipContent } from 'core/components/Tooltip'
// A reusable component that builds a vertical box shape using svg
// Note: numbers here are px, not the real values in the dataset.

import { fontSize, spacing } from 'core/theme'
import { useI18n } from 'core/i18n/i18nContext'

export type HorizontalBoxProps = BoxProps & { height: number }
export const HorizontalBox = ({
    i18nNamespace,
    boxData,
    percentilesData,
    height,
    stroke,
    fill,
    labelFormatter
}: HorizontalBoxProps) => {
    const { getString } = useI18n()

    const { p0, p10, p25, p50, p75, p90, p100 } = boxData

    const p50ValueLabel = labelFormatter(percentilesData.p50)
    const valueLabelWidth = p50ValueLabel.length * 9
    const valueLabelHeight = 24

    const label = getString('charts.nth_percentile_value', {
        values: { percentile: 50, value: p50ValueLabel }
    })?.t

    const p50Ref = React.createRef<SVGGElement>()

    const percentileProps = {
        boxData,
        percentilesData,
        stroke,
        strokeWidth: STROKE_WIDTH,
        height,
        labelFormatter
    }

    return (
        <>
            {/* horizontal line */}
            <line
                x1={p10}
                x2={p90}
                y1={height / 2}
                y2={height / 2}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />
            {/* 10th percentile */}
            <PercentileDot p={10} {...percentileProps} />

            {/* 25th percentile */}
            <PercentileDot p={25} {...percentileProps} />

            {/* 75th percentile */}
            <PercentileDot p={75} {...percentileProps} />

            {/* 90th percentile */}
            <PercentileDot p={90} {...percentileProps} />

            {/* box */}
            <rect
                x={p25}
                y={0}
                width={p75 - p25}
                height={height}
                stroke={stroke}
                // fill={fill}
                fill="url(#VelocityVertical2)"
            />

            {/* 50th percentile */}
            <line
                x1={p50}
                x2={p50}
                y1={0}
                y2={height}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH * 3}
            />
            <g transform={`translate(${p50}, ${height / 2})`} ref={p50Ref}>
                <Background_
                    height={valueLabelHeight}
                    width={valueLabelWidth}
                    x={-valueLabelWidth / 2}
                    y={-valueLabelHeight / 2}
                    stroke={stroke}
                    rx={valueLabelHeight / 2}
                    ry={valueLabelHeight / 2}
                    fill="url(#VelocityVertical2)"
                    fill="#333"
                />
                <Text_
                    className="boxplot-chart-label"
                    stroke={stroke}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                >
                    {p50ValueLabel}
                </Text_>
            </g>
            <TooltipItem triggerRef={p50Ref} label={label} />
        </>
    )
}

const DOT_RADIUS = 10
const PercentileDot = ({
    p,
    boxData,
    percentilesData,
    stroke,
    strokeWidth,
    height,
    labelFormatter
}) => {
    const { getString } = useI18n()

    const pKey = `p${p}`
    const x = boxData[pKey]
    const value = percentilesData[pKey]
    const pRef = React.createRef<SVGCircleElement>()

    const valueLabel = labelFormatter(value)
    const label = getString('charts.nth_percentile_value', {
        values: { percentile: p, value: valueLabel }
    })?.t
    return (
        <g transform={`translate(${x}, ${height / 2})`}>
            <circle cx={0} cy={0} r={DOT_RADIUS + 5} fill="transparent" ref={pRef} />
            <circle
                cx={0}
                cy={0}
                r={DOT_RADIUS}
                stroke={stroke}
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle cx={0} cy={0} r={DOT_RADIUS / 3} fill={stroke} />
            <TooltipItem triggerRef={pRef} label={label} direction={p <= 50 ? 'right' : 'left'} />
        </g>
    )
}

const TOOLTIP_OFFSET = 2
const TOOLTIP_WIDTH = 250
const TOOLTIP_HEIGHT = 250
const TooltipItem = ({
    triggerRef,
    label,
    direction
}: {
    triggerRef: React.RefObject<SVGElement>
    label: string
    direction: 'left' | 'right'
}) => {
    let x = TOOLTIP_OFFSET
    const y = TOOLTIP_OFFSET
    if (direction === 'left') {
        x = x - TOOLTIP_WIDTH
    }
    return (
        <Tooltip triggerRef={triggerRef}>
            <foreignObject x={x} y={y} width={TOOLTIP_WIDTH} height={TOOLTIP_HEIGHT}>
                <TooltipContent_>{label}</TooltipContent_>
            </foreignObject>
        </Tooltip>
    )
}
const Text_ = styled.text`
    cursor: default;
`

const TooltipContent_ = styled.div`
    background: ${props => props.theme.colors.backgroundBackground};
    font-size: ${fontSize('small')};
    padding: ${spacing(0.3)} ${spacing(0.6)};
    border: 1px solid ${props => props.theme.colors.border};
    z-index: 10000;
    width: min-content;
    white-space: nowrap;
    p:last-child {
        margin: 0;
    }
    // see https://www.joshwcomeau.com/css/designing-shadows/
    /* filter: drop-shadow(1px 2px 8px hsl(220deg 60% 50% / 0.3))
    drop-shadow(2px 4px 16px hsl(220deg 60% 50% / 0.3))
    drop-shadow(4px 8px 32px hsl(220deg 60% 50% / 0.3)); */
`

const Background_ = styled.rect``
