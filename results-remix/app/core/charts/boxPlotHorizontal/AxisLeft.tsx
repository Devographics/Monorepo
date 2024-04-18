import React, { useMemo } from 'react'
import { ScaleBand } from 'd3'
import { BlockLegend } from 'core/types'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { Bucket, Entity } from '@devographics/types'
import { UserIcon } from 'core/icons'
import { MARGIN } from './HorizontalBoxPlotChart'
import { TooltipItem } from './TooltipItem'
import sumBy from 'lodash/sumBy'

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
    buckets,
    i18nNamespace
}: AxisLeftProps) => {
    const { getString } = useI18n()

    const tickRef = React.createRef<SVGGElement>()

    const ticks = useMemo(() => {
        return yScale.domain().map(value => ({
            value,
            yOffset: (yScale(value) ?? 0) + rowHeight / 2
        }))
    }, [yScale])

    return (
        <>
            {/* Ticks and labels */}
            {ticks.map(({ value, yOffset }) => {
                // const legendItem = legends?.find(item => item.id === String(value))
                // const label = legendItem?.shortLabel || legendItem?.label
                const bucket = buckets?.find(b => b.id === value)
                const { key, label: tickLabel } = getItemLabel({
                    i18nNamespace,
                    entity: bucket?.entity,
                    id: value,
                    getString
                })
                const tickLabelString = String(tickLabel)

                const shortenedTickLabel =
                    tickLabelString?.length > 12 ? tickLabelString?.slice(0, 12) + '…' : tickLabel

                // note: we sum all the facetBuckets to get the intersection count of respondents who
                // have answered both questions
                const respondentsCount = sumBy(bucket?.facetBuckets, fb => fb?.count || 0)

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
                            ref={tickRef}
                            key={value}
                            style={{
                                fill: stroke,
                                fontSize: '13px',
                                textAnchor: 'start',
                                transform: `translate(-${MARGIN.left}px, 4px)`,
                                alignmentBaseline: 'middle'
                            }}
                        >
                            {shortenedTickLabel}
                        </text>
                        <TooltipItem triggerRef={tickRef} label={tickLabelString} />

                        {respondentsCount > 0 && (
                            <g
                                style={{ transform: `translate(${contentWidth + 20}px, 4px)` }}
                                color={`${stroke}66`}
                            >
                                <text
                                    key={value}
                                    style={{
                                        fill: 'currentColor',
                                        fontSize: '13px',
                                        textAnchor: 'start',
                                        transform: `translate(20px, 0px)`,
                                        alignmentBaseline: 'middle'
                                    }}
                                >
                                    {respondentsCount}
                                </text>
                                <g style={{ transform: `translate(0px, -13px)` }}>
                                    <UserIcon inSVG={true} size={16} />
                                </g>
                            </g>
                        )}
                    </g>
                )
            })}
        </>
    )
}

export default AxisLeft
