import React from 'react'
import styled from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import { fontSize, fontWeight } from 'core/theme'
import Tip from 'core/components/Tooltip'
import { Bucket, PercentileData, Percentiles } from '@devographics/types'
import { useDefaultColorScale } from '../../../common2/helpers/colors'
import { DEFAULT } from '@devographics/constants'
const STROKE_WIDTH = 1

export type BoxProps = {
    rowHeight: number
    i18nNamespace?: string
    boxData: PercentileData
    percentilesData: PercentileData
    stroke: string
    fill?: string
    labelFormatter: (v: number) => string
    contentWidth: number
    bucket: Bucket
}

export const HorizontalBox = ({
    i18nNamespace,
    boxData,
    percentilesData,
    stroke,
    contentWidth,
    bucket,
    rowHeight,
    labelFormatter
}: BoxProps) => {
    const { getString } = useI18n()

    const { p0, p10, p25, p50, p75, p90, p100 } = boxData

    const p50ValueLabel = labelFormatter(percentilesData.p50)
    const valueLabelWidth = Math.max(50, String(p50ValueLabel).length * 9)
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

    const colorScale = useDefaultColorScale()

    const gradient = colorScale[bucket.id] || colorScale[DEFAULT]
    const gradientId = `gradient_${bucket.id}`

    return bucket.hasInsufficientData ? (
        <g>
            <InsufficientData_
                className="insufficient-data"
                width={`${contentWidth}px`}
                textAnchor="start"
                alignmentBaseline="middle"
                y={rowHeight / 2 + 3}
            >
                {getString('charts.insufficient_data')?.t}
            </InsufficientData_>
        </g>
    ) : (
        <>
            <defs>
                <linearGradient id={gradientId}>
                    <stop offset="0%" stopColor={gradient[0]} />
                    <stop offset="100%" stopColor={gradient[1]} />
                </linearGradient>
            </defs>

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
                y={0}
                width={p75 - p25}
                height={rowHeight}
                stroke={stroke}
                // fill={fill}
                fill={`url(#${gradientId})`}
            />

            {/* 50th percentile */}
            <line x1={p50} x2={p50} y1={0} y2={0} stroke={stroke} strokeWidth={STROKE_WIDTH * 3} />
            <Tip
                trigger={
                    <g transform={`translate(${p50}, ${rowHeight / 2})`} ref={p50Ref}>
                        <Background_
                            height={valueLabelHeight}
                            width={valueLabelWidth}
                            x={-valueLabelWidth / 2}
                            y={-valueLabelHeight / 2}
                            stroke={stroke}
                            rx={valueLabelHeight / 2}
                            ry={valueLabelHeight / 2}
                            // fill={`url(#${gradient?.id})`}
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
                }
                contents={label}
                asChild={true}
            />
            {/* <TooltipItem triggerRef={p50Ref} label={label} /> */}
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
}: {
    p: number
    boxData: BoxProps['boxData']
    percentilesData: BoxProps['percentilesData']
    stroke: string
    strokeWidth: number
    rowHeight: number
    labelFormatter: BoxProps['labelFormatter']
}) => {
    const { getString } = useI18n()

    const pKey = `p${p}` as Percentiles
    const x = boxData[pKey]
    const value = percentilesData[pKey]
    const pRef = React.createRef<SVGCircleElement>()

    const valueLabel = labelFormatter(value)
    const label = getString('charts.nth_percentile_value', {
        values: { percentile: p, value: valueLabel }
    })?.t
    return (
        <>
            <Tip
                trigger={
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
                }
                contents={label}
                asChild={true}
            />

            {/* <TooltipItem triggerRef={pRef} label={label} direction={p <= 50 ? 'right' : 'left'} /> */}
        </>
    )
}

const Text_ = styled.text`
    cursor: default;
`

const InsufficientData_ = styled.text`
    fill: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    text-transform: uppercase;
    font-weight: ${fontWeight('bold')};
    font-size: ${fontSize('smaller')};
    text-align: center;
`

const Background_ = styled.rect``
