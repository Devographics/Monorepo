import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { Bucket, PercentileData } from '@devographics/types'
import { useDefaultColorScale } from '../../../common2/helpers/colors'
import { DEFAULT } from '@devographics/constants'
import { HorizontalBarChartState } from '../../types'
import { Percentiles } from '@devographics/types'
import { Dot, DotProps, InsufficientData_, ValueLabel } from './Dot'

export const STROKE_WIDTH = 1

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
    isReversed?: boolean
    chartState: HorizontalBarChartState
    xScale: d3.ScaleLinear<number, number, never>
}

export const PercentilesBox = ({
    i18nNamespace,
    boxData,
    percentilesData,
    stroke,
    contentWidth,
    bucket,
    rowHeight,
    labelFormatter,
    isReversed,
    chartState
}: BoxProps) => {
    const { getString } = useI18n()

    const { p0, p10, p25, p50, p75, p90, p100 } = boxData

    const getXCoord = (x: number) => (isReversed ? contentWidth - x : x)

    const percentileProps = {
        stroke,
        strokeWidth: STROKE_WIDTH,
        rowHeight,
        labelFormatter,
        getXCoord,
        boxData,
        percentilesData
    }

    const colorScale = useDefaultColorScale()

    const gradient = colorScale[bucket.id] || colorScale[DEFAULT]
    const gradientId = `gradient_${bucket.id}`

    const p50ValueLabel = getString('charts.nth_percentile_value', {
        values: { percentile: 50, value: labelFormatter(percentilesData.p50) }
    })?.t

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
                x1={getXCoord(p10)}
                x2={getXCoord(p90)}
                y1={rowHeight / 2}
                y2={rowHeight / 2}
                stroke={stroke}
                strokeWidth={STROKE_WIDTH}
            />

            {/* 10, 25, 75, and 90th percentiles */}
            {[10, 25, 75, 90].map(p => (
                <PercentileDot key={p} p={p} {...percentileProps} />
            ))}

            {/* box */}
            <rect
                x={isReversed ? getXCoord(p75) : p25}
                y={0}
                width={p75 - p25}
                height={rowHeight}
                stroke={stroke}
                // fill={fill}
                fill={`url(#${gradientId})`}
            />

            {/* 50th percentile */}
            <line x1={p50} x2={p50} y1={0} y2={0} stroke={stroke} strokeWidth={STROKE_WIDTH * 3} />
            <ValueLabel
                xCoord={getXCoord(p50)}
                stroke={stroke}
                value={percentilesData.p50}
                labelFormatter={labelFormatter}
                rowHeight={rowHeight}
                label={p50ValueLabel}
            />
        </>
    )
}

export const PercentileDot = ({
    p,
    stroke,
    strokeWidth,
    rowHeight,
    labelFormatter,
    getXCoord,
    boxData,
    percentilesData
}: DotProps & {
    p: number
    labelFormatter: BoxProps['labelFormatter']
    getXCoord: (x: number) => number
    boxData: BoxProps['boxData']
    percentilesData: BoxProps['percentilesData']
}) => {
    const { getString } = useI18n()

    const pKey = `p${p}` as Percentiles
    const xCoord = getXCoord(boxData[pKey])
    const value = percentilesData[pKey]

    const valueLabel = labelFormatter(value)
    const label = getString('charts.nth_percentile_value', {
        values: { percentile: p, value: valueLabel }
    })?.t

    return (
        <Dot
            xCoord={xCoord}
            stroke={stroke}
            strokeWidth={strokeWidth}
            rowHeight={rowHeight}
            label={label}
        />
    )
}
