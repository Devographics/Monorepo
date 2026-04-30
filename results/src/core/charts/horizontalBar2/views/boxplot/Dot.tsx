import React from 'react'
import Tip from 'core/components/Tooltip'
import { BoxProps } from './Percentiles'
import './Dot.scss'

export const DOT_RADIUS = 10

export interface DotProps {
    stroke: string
    strokeWidth: number
    rowHeight: number
}

export const Dot = ({
    xCoord,
    stroke,
    strokeWidth,
    rowHeight,
    label
}: DotProps & { label: string; xCoord: number }) => {
    return (
        <Tip
            trigger={
                <g transform={`translate(${xCoord}, ${rowHeight / 2})`}>
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
    )
}

export const ValueLabel = ({
    xCoord,
    rowHeight,
    stroke,
    labelFormatter,
    label,
    value
}: Omit<DotProps, 'strokeWidth'> & {
    xCoord: number
    value: number
    labelFormatter: BoxProps['labelFormatter']
    label: string
}) => {
    const p50ValueLabel = labelFormatter(value)

    const valueLabelWidth = Math.max(50, String(p50ValueLabel).length * 9)
    const valueLabelHeight = 24

    return (
        <Tip
            trigger={
                <g transform={`translate(${xCoord}, ${rowHeight / 2})`}>
                    <rect
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
                    <text
                        className="boxplot-chart-label"
                        stroke={stroke}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="11"
                    >
                        {p50ValueLabel}
                    </text>
                </g>
            }
            contents={label}
            asChild={true}
        />
    )
}
