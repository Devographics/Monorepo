// @ts-ignore
import React, { CSSProperties, Fragment } from 'react'
import { useTheme } from '@nivo/core'
// @ts-ignore
import { useI18n } from 'core/i18n/i18nContext'

const ITEM_WIDTH = 50
const ITEM_HEIGHT = 14

interface ToolsExperienceMarimekkoLegendProps {
    colors: Record<string, string>
}

export const ToolsExperienceMarimekkoLegend = ({ colors }: ToolsExperienceMarimekkoLegendProps) => {
    const theme = useTheme()
    const { translate } = useI18n()

    const items = [
        {
            id: translate('options.tools.would_not_use.short'),
            x: 0,
            width: ITEM_WIDTH,
            fill: colors.would_not_use,
            label: [ITEM_WIDTH * 0.25, 12],
            labelAnchor: 'end',
        },
        {
            id: translate('options.tools.not_interested.short'),
            x: 0,
            width: ITEM_WIDTH,
            fill: colors.not_interested,
            label: [ITEM_WIDTH * 0.25, 30],
            labelAnchor: 'end',
        },
        {
            id: translate('options.tools.would_use.short'),
            x: 0,
            width: ITEM_WIDTH,
            fill: colors.would_use,
            label: [ITEM_WIDTH * 3.75, 12],
            labelAnchor: 'start',
        },
        {
            id: translate('options.tools.interested.short'),
            x: 0,
            width: ITEM_WIDTH,
            fill: colors.interested,
            label: [ITEM_WIDTH * 3.75, 30],
            labelAnchor: 'start',
        },
    ]

    let x = 0
    items.forEach((item) => {
        item.x = x
        x += item.width
    })
    const totalWidth = x

    return (
        <g transform={`translate(${ITEM_WIDTH * -2}, 0)`}>
            {items.map((item) => (
                <rect
                    key={item.id}
                    x={item.x}
                    width={item.width}
                    height={ITEM_HEIGHT}
                    fill={item.fill}
                />
            ))}
            {items.map((item) => (
                <Fragment key={item.id}>
                    <path
                        fill="none"
                        stroke={theme.axis.ticks.line.stroke}
                        d={`
                            M${item.x + 2},${ITEM_HEIGHT + 2}
                            L${item.x + 2},${ITEM_HEIGHT + 8}
                            L${item.x + item.width - 2},${ITEM_HEIGHT + 8}
                            L${item.x + item.width - 2},${ITEM_HEIGHT + 2}
                        `}
                    />
                    <line
                        x1={item.x + item.width / 2}
                        x2={item.x + item.width / 2}
                        y1={ITEM_HEIGHT + 8}
                        y2={ITEM_HEIGHT + 8 + item.label[1]}
                        fill="none"
                        stroke={theme.axis.ticks.line.stroke}
                    />
                    <line
                        x1={item.label[0]}
                        x2={item.x + item.width / 2}
                        y1={ITEM_HEIGHT + 8 + item.label[1]}
                        y2={ITEM_HEIGHT + 8 + item.label[1]}
                        fill="none"
                        stroke={theme.axis.ticks.line.stroke}
                    />
                    <text
                        x={item.label[0] + (item.labelAnchor === 'end' ? -8 : 8)}
                        y={ITEM_HEIGHT + 8 + item.label[1]}
                        fill={colors.text}
                        textAnchor={item.labelAnchor}
                        dominantBaseline="middle"
                        style={theme.axis.ticks.text as any}
                    >
                        {item.id}
                    </text>
                </Fragment>
            ))}
            <path
                fill="none"
                stroke={theme.axis.ticks.line.stroke}
                d={`
                    M${totalWidth + 2},${2}
                    L${totalWidth + 8},${2}
                    L${totalWidth + 8},${ITEM_HEIGHT - 2}
                    L${totalWidth + 2},${ITEM_HEIGHT - 2}
                `}
            />
            <line
                x1={totalWidth + 8}
                x2={totalWidth + 28}
                y1={ITEM_HEIGHT / 2}
                y2={ITEM_HEIGHT / 2}
                fill="none"
                stroke={theme.axis.ticks.line.stroke}
            />
            <text
                x={totalWidth + 28 + 8}
                y={ITEM_HEIGHT / 2}
                fill={colors.text}
                dominantBaseline="middle"
                style={theme.axis.ticks.text as any}
            >
                {translate(`options.experience_ranking.awareness`)}
            </text>
        </g>
    )
}
