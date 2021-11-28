import React, { memo, useMemo } from 'react'
import { useTransition, animated, to } from 'react-spring'
import { useTheme } from 'styled-components'
import { useMotionConfig, useTheme as useNivoTheme } from '@nivo/core'
import { useTooltip } from '@nivo/tooltip'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'
import { ComputedDatum, ComputedPoint } from './types'

const Tooltip = memo(
    ({ data, i18nNamespace }: { data: ComputedPoint['data']; i18nNamespace: string }) => {
        const theme = useNivoTheme()
        const { translate } = useI18n()

        return (
            <div style={theme.tooltip.container as any}>
                <strong>{translate(`options.${i18nNamespace}.${data.index}`)}</strong>
                <br />
                <strong>{data.percentage}%</strong> ({data.percentageDelta}%)
                <br />
                out of {data.count} responses
            </div>
        )
    }
)

interface DotData {
    key: string
    x: number
    y: number
    color: string
    data: ComputedPoint['data']
}

interface DotsProps {
    data: ComputedDatum[]
    itemHeight: number
    i18nNamespace: string
}

export const Dots = ({ data, itemHeight, i18nNamespace }: DotsProps) => {
    const theme = useTheme()

    const dotsData = useMemo(
        () =>
            data.reduce((acc, datum) => {
                const y = datum.index * itemHeight + itemHeight * 0.5

                return [
                    ...acc,
                    ...datum.data.map((point, index) => {
                        return {
                            key: `${datum.index}.${index}`,
                            x: point.x,
                            y: y + point.y,
                            color: datum.color,
                            data: point.data,
                        }
                    }),
                ]
            }, [] as DotData[]),
        [data, itemHeight]
    )

    const { animate, config: springConfig } = useMotionConfig()

    const transition = useTransition<
        DotData,
        {
            x: number
            y: number
            color: string
            opacity: number
            radius: number
        }
    >(dotsData, {
        key: (dot) => dot.key,
        initial: (dot) => ({
            x: dot.x,
            y: dot.y,
            color: dot.color,
            opacity: 1,
            radius: 4,
        }),
        from: (dot) => ({
            x: dot.x,
            y: dot.y,
            color: dot.color,
            opacity: 0,
            radius: 0,
        }),
        enter: (dot) => ({
            x: dot.x,
            y: dot.y,
            color: dot.color,
            opacity: 1,
            radius: 4,
        }),
        update: (dot) => ({
            x: dot.x,
            y: dot.y,
            color: dot.color,
            opacity: 1,
            radius: 4,
        }),
        leave: (dot) => ({
            x: dot.x,
            y: dot.y,
            color: dot.color,
            opacity: 0,
            radius: 0,
        }),
        config: springConfig,
        immediate: !animate,
    })

    const { showTooltipFromEvent, hideTooltip } = useTooltip()
    const onMouseEnter = (event: any, data: DotData) => {
        showTooltipFromEvent(<Tooltip data={data.data} i18nNamespace={i18nNamespace} />, event)
    }

    return (
        <g>
            {transition((style, dot) => (
                <animated.circle
                    key={dot.key}
                    cx={style.x}
                    cy={style.y}
                    r={to(style.radius, (radius) => Math.max(radius, 0))}
                    fill={theme.colors.background}
                    stroke={style.color}
                    strokeWidth={2}
                    onMouseEnter={(event) => {
                        onMouseEnter(event, dot)
                    }}
                    onMouseMove={(event) => {
                        onMouseEnter(event, dot)
                    }}
                    onMouseLeave={hideTooltip}
                />
            ))}
        </g>
    )
}
