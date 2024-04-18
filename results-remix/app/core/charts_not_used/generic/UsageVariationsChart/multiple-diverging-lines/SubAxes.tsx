import React from 'react'
import { ScaleLinear } from 'd3-scale'
import { useTheme } from '@nivo/core'
import { ComputedDatum } from './types'

interface SubAxesProps {
    data: ComputedDatum[]
    valueScale: ScaleLinear<number, number>
    itemHeight: number
    width: number
}

export const SubAxes = ({ data, itemHeight, width }: SubAxesProps) => {
    const theme = useTheme()

    return (
        <g>
            {data.map((datum) => {
                return (
                    <g key={datum.id} transform={`translate(0, ${datum.index * itemHeight})`}>
                        {datum.index === 0 && <line x2={width} {...(theme.grid.line as any)} />}
                        <g transform={`translate(0, ${itemHeight})`}>
                            <line x2={width} {...(theme.grid.line as any)} />
                        </g>
                        <text
                            x={width + 12}
                            y={itemHeight * 0.5}
                            dy={4}
                            style={theme.axis.ticks.text as any}
                        >
                            {datum.baseline}%
                        </text>
                    </g>
                )
            })}
        </g>
    )
}
