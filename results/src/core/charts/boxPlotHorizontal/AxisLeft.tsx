import React, { useMemo } from 'react'
import { ScaleBand, ScaleLinear } from 'd3'
import { MARGIN } from '../boxPlotHorizontal/HorizontalBoxPlotChart'
import { BlockLegend } from 'core/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from 'core/i18n/i18nContext'
import { Entity } from '@devographics/types'

type AxisLeftProps = {
    width: number
    yScale: ScaleBand<string>
    pixelsPerTick: number
    stroke: string
    labelFormatter: (any) => string
    legends?: BlockLegend[]
    i18nNamespace?: string
    entity?: Entity
}

// tick length
const TICK_LENGTH = 6

export const AxisLeft = ({
    width,
    yScale,
    pixelsPerTick,
    stroke,
    labelFormatter,
    rowHeight,
    legends,
    entity,
    i18nNamespace
}: AxisLeftProps) => {
    const { getString } = useI18n()

    const range = yScale.range()

    // const ticks = useMemo(() => {
    //     const height = range[0] - range[1]
    //     const numberOfTicksTarget = legends?.length

    //     return yScale.ticks(numberOfTicksTarget).map(value => ({
    //         value,
    //         yOffset: yScale(value)
    //     }))
    // }, [yScale])

    const ticks = useMemo(() => {
        return yScale.domain().map(value => ({
            value,
            yOffset: yScale(value)! + rowHeight / 2 - 10
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
                const legendItem = legends?.find(item => item.id === String(value))
                const label = legendItem?.shortLabel || legendItem?.label

                const { key, label: tickLabel } = getItemLabel({
                    i18nNamespace,
                    entity,
                    id: value,
                    getString,
                    label
                })

                return (
                    <g key={value} transform={`translate(0, ${yOffset})`}>
                        <line
                            x2={-TICK_LENGTH}
                            stroke="#dddddd"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                        />
                        <line
                            x2={width}
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
                            {tickLabel}
                        </text>
                    </g>
                )
            })}
        </>
    )
}

export default AxisLeft
