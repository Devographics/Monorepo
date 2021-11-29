import React, { memo, useMemo } from 'react'
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend, TickItemProps } from 'core/types'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'

const labelMaxLength = 20

export const Text = ({
    hasLink = false,
    label,
    tickRotation,
}: {
    hasLink: boolean
    label: string
    tickRotation?: number
}) => {
    const theme = useTheme()
    const shortenLabel = label.length > labelMaxLength
    const shortLabel = shortenLabel ? label.substr(0, labelMaxLength) + '…' : label

    const textProps = {
        transform: 'translate(-10,0) rotate(0)',
        dominantBaseline: 'central',
        textAnchor: 'end',
        style: {
            fill: hasLink ? theme.colors.link : theme.colors.text,
            fontSize: 14,
            fontFamily: theme.typography.fontFamily,
        },
    }

    if (tickRotation) {
        textProps.transform = `translate(0,-10) rotate(${tickRotation} 0 0)`
        textProps.textAnchor = 'start'
    }

    return (
        <text {...textProps}>
            <title>{label}</title>
            {shortLabel || label}
        </text>
    )
}

export const TickItem = (tick: TickItemProps) => {
    const { translate } = useI18n()

    const { x, y, value, shouldTranslate, i18nNamespace, entity, tickRotation } = tick

    let label, link

    if (entity) {
        const { name, homepage, github } = entity
        if (name) {
            label = name
        }
        link = homepage || (github && github.url)

        // @todo: remove this once all entities have been added
        if (!label) {
            label = value
        }
    } else if (shouldTranslate) {
        label = translate(`options.${i18nNamespace}.${value}`)
    } else {
        label = value
    }

    return (
        <g transform={`translate(${x},${y})`}>
            {link ? (
                <a href={link}>
                    <Text hasLink={true} label={label} tickRotation={tickRotation} />
                </a>
            ) : (
                <Text hasLink={false} label={label} tickRotation={tickRotation} />
            )}
        </g>
    )
}

export default TickItem
