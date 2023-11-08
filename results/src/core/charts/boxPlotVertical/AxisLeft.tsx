import React, { useMemo } from 'react'
import { ScaleLinear } from 'd3'
import { MARGIN } from '../boxPlotHorizontal/HorizontalBoxPlotChart'
import { BlockLegend } from 'core/types'

type AxisLeftProps = {
    width: number
    yScale: ScaleLinear<number, number>
    pixelsPerTick: number
    stroke: string
    labelFormatter: (v: number) => string
    legends?: BlockLegend[]
}

// tick length
const TICK_LENGTH = 6

export const AxisLeft = ({
    width,
    yScale,
    pixelsPerTick,
    stroke,
    labelFormatter,
    legends
}: AxisLeftProps) => {
    const range = yScale.range()

    const ticks = useMemo(() => {
        const height = range[0] - range[1]
        const numberOfTicksTarget = Math.floor(height / pixelsPerTick)

        return yScale.ticks(numberOfTicksTarget).map(value => ({
            value,
            yOffset: yScale(value)
        }))
    }, [yScale])

    return (
        <>
            {/* Main vertical line */}
            {/* <path
                d={['M', 0, range[0], 'L', 0, range[1]].join(' ')}
                fill="none"
                stroke="currentColor"
            /> */}

            {/* Ticks and labels */}
            {ticks.map(({ value, yOffset }) => {
                const label = labelFormatter(value)

                return (
                    <g key={value} transform={`translate(0, ${yOffset})`}>
                        <line
                            x2={-TICK_LENGTH}
                            stroke="#dddddd"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                        />
                        <line
                            x2={width - MARGIN.right}
                            stroke="#dddddd"
                            strokeWidth="1"
                            strokeDasharray="1 2"
                            strokeOpacity="0.4"
                        />

                        <text
                            key={value}
                            style={{
                                fill: stroke,
                                fontSize: '12px',
                                textAnchor: 'end',
                                transform: 'translateX(-20px)',
                                alignmentBaseline: 'middle'
                            }}
                        >
                            {label}
                        </text>
                    </g>
                )
            })}
        </>
    )
}

export default AxisLeft
