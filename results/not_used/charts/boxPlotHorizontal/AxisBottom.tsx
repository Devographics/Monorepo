import React, { useMemo } from 'react'
import { ScaleBand, ScaleLinear } from 'd3'
import { BlockLegend } from 'core/types'
import { NO_ANSWER } from '@devographics/constants'
import { useI18n } from '@devographics/react-i18n'

type AxisBottomProps = {
    xScale: ScaleLinear<number, number>
    legends?: BlockLegend[]
    stroke: string
    labelFormatter: (v: number) => string
    variant: 'horizontal' | 'vertical'
}

// tick length
const TICK_LENGTH = 6

type Tick = {
    value: number
    xOffset: number
}
export const AxisBottom = ({
    xScale,
    legends,
    stroke,
    labelFormatter,
    pixelsPerTick
}: AxisBottomProps) => {
    const [min, max] = xScale.range()

    const range = xScale.range()

    // const ticks = useMemo(() => {
    //     return xScale.domain().map(value => ({
    //         value,
    //         xOffset: xScale(value)! + xScale.bandwidth() / 2
    //     }))
    // }, [xScale])

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
            {/* Main horizontal line */}
            {/* <path
                d={['M', min + 20, 0, 'L', max - 20, 0].join(' ')}
                fill="none"
                stroke="currentColor"
            /> */}

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
    const { getString } = useI18n()

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
                {value === NO_ANSWER ? getString('charts.no_answer')?.t : label}
            </text>
        </g>
    )
}
export default AxisBottom
