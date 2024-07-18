// not used anymore, replace with common/Axis
import React from 'react'
import { BlockLegend } from 'core/types'
import { Tick } from 'core/charts/common2/types'

type AxisProps = {
    ticks: Tick[]
    legends?: BlockLegend[]
    stroke: string
    labelFormatter: (v: number) => string
    variant: 'top' | 'bottom'
}

// tick length
const TICK_LENGTH = 6

export const Axis = ({ ticks, stroke, labelFormatter, variant = 'top' }: AxisProps) => {
    return (
        <svg className="boxplot-svg boxplot-axis-svg">
            {/* Ticks and labels */}
            {ticks.map((tick, index) => (
                <TickItem
                    key={tick.value}
                    tick={tick}
                    labelFormatter={labelFormatter}
                    stroke={stroke}
                    variant={variant}
                    index={index}
                />
            ))}
        </svg>
    )
}

const TickItem = ({
    tick,
    stroke,
    labelFormatter,
    variant,
    index
}: {
    tick: Tick
    stroke: string
    labelFormatter: (s: number) => string
    variant: AxisProps['variant']
    index: number
}) => {
    const { value, xOffset } = tick
    const label = labelFormatter(value)
    return (
        <g key={value} transform={`translate(${xOffset}, ${variant === 'top' ? 25 : 0})`}>
            <line y2={TICK_LENGTH} stroke="#dddddd" strokeWidth="1" strokeOpacity="0.4" />
            <text
                key={value}
                style={{
                    fill: stroke,
                    fontSize: '12px',
                    textAnchor: 'middle',
                    transform: `translateY(${variant === 'top' ? -10 : 25}px)`
                }}
            >
                {label}
            </text>
        </g>
    )
}

export default Axis
