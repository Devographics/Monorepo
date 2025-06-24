import React from 'react'
import styled from 'styled-components'
import { useI18n } from '@devographics/react-i18n'
import { fontSize, fontWeight } from 'core/theme'
import Tip from 'core/components/Tooltip'
import { BoxProps } from './Percentiles'

export const DOT_RADIUS = 10

export interface DotProps {
    stroke: string
    strokeWidth: number
    rowHeight: number
}

export const InsufficientData_ = styled.text`
    fill: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    text-transform: uppercase;
    font-weight: ${fontWeight('bold')};
    font-size: ${fontSize('smaller')};
    text-align: center;
`

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
    )
}

export const Text_ = styled.text`
    cursor: default;
`

export const Background_ = styled.rect``
