import React from 'react'
import { Margin } from '@nivo/core'
import { ComputedDatum } from './types'
import { useTheme } from 'styled-components'

interface LabelsProps {
    data: ComputedDatum[]
    itemHeight: number
    width: number
    margin: Margin
}

const textStyle = {
    fontSize: 12,
    fontWeight: 600,
}

export const Labels = ({ data, itemHeight, width, margin }: LabelsProps) => {
    const theme = useTheme()

    return (
        <g>
            {data.map((datum) => {
                return (
                    <g
                        key={datum.id}
                        transform={`translate(0, ${datum.index * itemHeight + itemHeight * 0.5})`}
                    >
                        <line
                            x1={-margin.left}
                            x2={width}
                            fill="none"
                            stroke={datum.color}
                            strokeWidth={1}
                            strokeDasharray={`3 5`}
                        />
                        <line x2={width} fill="none" stroke={datum.color} strokeWidth={1} />
                        <text
                            x={-margin.left}
                            dy={4}
                            stroke={theme.colors.background}
                            strokeMiterlimit="round"
                            style={textStyle}
                            strokeWidth={18}
                        >
                            {datum.name}
                        </text>
                        <text x={-margin.left} dy={4} fill={datum.color} style={textStyle}>
                            {datum.name}
                        </text>
                    </g>
                )
            })}
        </g>
    )
}
