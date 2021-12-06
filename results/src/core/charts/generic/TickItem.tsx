import React, { memo, useMemo } from 'react'
import { ChartComponentProps, BlockUnits, BucketItem, BlockLegend, TickItemProps } from 'core/types'
import { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import TooltipComponent from 'core/components/Tooltip'
import * as Tooltip from '@radix-ui/react-tooltip'

const labelMaxLength = 20

export const Text = ({
    hasLink = false,
    label,
    description,
    tickRotation,
    i18nNamespace
}: {
    hasLink: boolean
    label: string
    description: string
    tickRotation?: number
    i18nNamespace?: string
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
            fontFamily: theme.typography.fontFamily
        }
    }

    if (tickRotation) {
        textProps.transform = `translate(0,-10) rotate(${tickRotation} 0 0)`
        textProps.textAnchor = 'start'
    }

    const component = (
        <text {...textProps}>
            <title>{description ?? label}</title>
            {shortLabel ?? label}
        </text>
    )
    return <TooltipComponent trigger={component} contents={description ?? label} asChild={true} />
}

export const TickItem = (tick: TickItemProps) => {
    const { translate, getString } = useI18n()

    const { x, y, value, shouldTranslate, i18nNamespace, entity, tickRotation } = tick

    let label,
        link,
        description = tick.description

    if (entity) {
        const { name, homepage, github } = entity
        if (name) {
            label = name
        }
        link = homepage?.url || github?.url

        // @todo: remove this once all entities have been added
        if (!label) {
            label = value
        }
    } else if (shouldTranslate) {
        label = translate(`options.${i18nNamespace}.${value}`)
        const descriptionString = getString(`options.${i18nNamespace}.${value}.description`)
        if (!descriptionString.missing) {
            description = descriptionString.t
        }
    } else {
        label = value
    }

    const textProps = {
        label,
        description,
        tickRotation
    }

    return (
        <g transform={`translate(${x},${y})`}>
            {link ? (
                <a href={link}>
                    <Text hasLink={true} {...textProps} />
                </a>
            ) : (
                <Text hasLink={false} {...textProps} />
            )}
        </g>
    )
}

export default TickItem
