import React, { useMemo } from 'react'
import { ScaleBand } from 'd3'
import { BlockLegend } from 'core/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from 'core/i18n/i18nContext'
import { Bucket, Entity } from '@devographics/types'
import { UserIcon } from 'core/icons'

type AxisLeftProps = {
    contentWidth: number
    yScale: ScaleBand<string>
    pixelsPerTick: number
    stroke: string
    labelFormatter: (any) => string
    legends?: BlockLegend[]
    i18nNamespace?: string
    entity?: Entity
    buckets?: Bucket[]
}

// tick length
const TICK_LENGTH = 6

export const AxisLeft = ({
    contentWidth,
    yScale,
    pixelsPerTick,
    stroke,
    labelFormatter,
    rowHeight,
    legends,
    entity,
    buckets,
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
            yOffset: yScale(value)! + rowHeight / 2
        }))
    }, [yScale])

    return (
        <>
            {/* Ticks and labels */}
            {ticks.map(({ value, yOffset }) => {
                const legendItem = legends?.find(item => item.id === String(value))
                const label = legendItem?.shortLabel || legendItem?.label
                const bucket = buckets?.find(b => b.id === value)
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
                            x1={contentWidth}
                            x2={contentWidth + TICK_LENGTH}
                            stroke="#dddddd"
                            strokeWidth="1"
                            strokeOpacity="0.4"
                        />
                        <line
                            x2={contentWidth}
                            stroke="#dddddd"
                            strokeWidth="1"
                            strokeDasharray="1 2"
                            strokeOpacity="0.4"
                        />

                        <text
                            key={value}
                            style={{
                                fill: stroke,
                                fontSize: '14px',
                                textAnchor: 'end',
                                transform: 'translate(-20px, 4px)',
                                alignmentBaseline: 'middle'
                            }}
                        >
                            {tickLabel}
                        </text>

                        <g
                            style={{ transform: `translate(${contentWidth + 20}px, 4px)` }}
                            color={`${stroke}66`}
                        >
                            <text
                                key={value}
                                style={{
                                    fill: 'currentColor',
                                    fontSize: '14px',
                                    textAnchor: 'start',
                                    transform: `translate(20px, 0px)`,
                                    alignmentBaseline: 'middle'
                                }}
                            >
                                {bucket?.count}
                            </text>
                            <g style={{ transform: `translate(0px, -13px)` }}>
                                <UserIcon inSVG={true} size={16} />
                            </g>
                        </g>
                    </g>
                )
            })}
        </>
    )
}

export default AxisLeft
