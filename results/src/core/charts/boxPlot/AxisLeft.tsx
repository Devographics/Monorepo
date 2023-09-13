import React, { useMemo } from 'react'
import { ScaleLinear } from 'd3'
import { MARGIN } from './BoxPlotChart'
import { BlockLegend } from 'core/types'

type AxisLeftProps = {
    width: number
    yScale: ScaleLinear<number, number>
    pixelsPerTick: number
    stroke: string
    labelFormatter: (any) => string
    legends?: BlockLegend[]
    variant: 'horizontal' | 'vertical'
}

// tick length
const TICK_LENGTH = 6

export const AxisLeft = ({
    width,
    yScale,
    pixelsPerTick,
    stroke,
    labelFormatter,
    legends,
    variant = 'vertical'
}: AxisLeftProps) => {
    const range = yScale.range()

    const ticks = useMemo(() => {
        const height = range[0] - range[1]
        const numberOfTicksTarget =
            variant === 'vertical' ? Math.floor(height / pixelsPerTick) : legends?.length

        return yScale.ticks(numberOfTicksTarget).map(value => ({
            value,
            yOffset: yScale(value)
        }))
    }, [yScale])

    console.log(ticks)
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
                let label
                if (variant === 'vertical') {
                    label = labelFormatter(value)
                } else {
                    const legendItem = legends?.[value]
                    label = legendItem?.shortLabel || legendItem?.label
                }
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
