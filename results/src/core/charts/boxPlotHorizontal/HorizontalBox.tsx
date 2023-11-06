import React from 'react'
import styled from 'styled-components'
import { BoxProps } from '../boxPlotVertical/VerticalBox'
const STROKE_WIDTH = 1
import { useI18n } from 'core/i18n/i18nContext'
import { TooltipItem } from './TooltipItem'

const BOX_HEIGHT = 30

export type HorizontalBoxProps = BoxProps & { height: number }
export const HorizontalBox = ({
    i18nNamespace,
    boxData,
    percentilesData,
    stroke,
    fill,
    rowHeight,
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
        rowHeight,
        labelFormatter
    }

    return (
        <>
            {/* horizontal line */}
            <line
                x1={p10}
                x2={p90}
                y1={rowHeight / 2}
                y2={rowHeight / 2}
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
                y={rowHeight / 2 - BOX_HEIGHT / 2}
                width={p75 - p25}
                height={BOX_HEIGHT}
                stroke={stroke}
                // fill={fill}
                fill="url(#VelocityVertical2)"
            />

            {/* 50th percentile */}
            <line
                x1={p50}
                x2={p50}
                y1={rowHeight / 2 - BOX_HEIGHT / 2}
                y2={rowHeight / 2 + BOX_HEIGHT / 2}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH * 3}
            />
            <g transform={`translate(${p50}, ${rowHeight / 2})`} ref={p50Ref}>
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
    rowHeight,
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
        <>
            <g transform={`translate(${x}, ${rowHeight / 2})`} ref={pRef}>
                <circle
                    cx={0}
                    cy={0}
                    r={DOT_RADIUS}
                    stroke={`${stroke}66`}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle cx={0} cy={0} r={DOT_RADIUS / 3} fill={`${stroke}bb`} />
                <circle cx={0} cy={0} r={DOT_RADIUS + 5} fill="transparent" />
            </g>
            <TooltipItem triggerRef={pRef} label={label} direction={p <= 50 ? 'right' : 'left'} />
        </>
    )
}

const Text_ = styled.text`
    cursor: default;
`

const Background_ = styled.rect``
