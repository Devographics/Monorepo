import React, { useMemo } from 'react'
import { ScaleLinear } from 'd3'
import { BlockLegend } from 'core/types'

type AxisBottomProps = {
    xScale: ScaleLinear<number, number>
    legends?: BlockLegend[]
    stroke: string
    labelFormatter: (v: number) => string
    pixelsPerTick: number
}

// tick length
const TICK_LENGTH = 6

type Tick = {
    value: number
    xOffset: number
}
export const AxisBottom = ({ xScale, stroke, labelFormatter, pixelsPerTick }: AxisBottomProps) => {
    const range = xScale.range()

    const ticks: Tick[] = useMemo(() => {
        const width = range[1] - range[0]
        const numberOfTicksTarget = Math.floor(width / pixelsPerTick)
        return xScale.ticks(numberOfTicksTarget).map(value => ({
            value,
            xOffset: xScale(value)
        }))
    }, [xScale])

    return (
        <>
            {/* Ticks and labels */}
            {ticks.map(tick => (
                <Tick
                    key={tick.value}
                    tick={tick}
                    labelFormatter={labelFormatter}
                    stroke={stroke}
                />
            ))}
        </>
    )
}

const Tick = ({
    tick,
    stroke,
    labelFormatter
}: {
    tick: Tick
    stroke: string
    labelFormatter: (s: number) => string
}) => {
    const { value, xOffset } = tick
    const label = labelFormatter(value)
    return (
        <g key={value} transform={`translate(${xOffset}, 0)`}>
            <line y2={TICK_LENGTH} stroke="#dddddd" strokeWidth="1" strokeOpacity="0.4" />
            <text
                key={value}
                style={{
                    fill: stroke,
                    fontSize: '12px',
                    textAnchor: 'middle',
                    transform: 'translateY(20px)'
                }}
            >
                {label}
            </text>
        </g>
    )
}

export default AxisBottom
