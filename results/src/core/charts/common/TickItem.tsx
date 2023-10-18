import React, { memo, useMemo } from 'react'
import {
    ChartComponentProps,
    BlockUnits,
    BucketItem,
    BlockLegend,
    TickItemProps
} from '@types/index'
import styled, { useTheme } from 'styled-components'
import { useI18n } from 'core/i18n/i18nContext'
import TooltipComponent from 'core/components/Tooltip'
import { CloseIcon, DotsIcon } from 'core/icons'
import TickItemLinks, { getSocialLinks } from 'core/charts/common/TickItemLinks'
import Popover from 'core/components/Popover2'
import { NO_ANSWER, NO_MATCH } from '@devographics/constants'
import { getItemLabel } from 'core/helpers/labels'

const labelMaxLength = 20

const shorten = (label: string) => {
    if (label?.length > labelMaxLength + 1) {
        return label?.substring(0, labelMaxLength) + '…'
    } else {
        return label
    }
}

const getTextOffset = () => 10

export const Text = ({
    key,
    hasLink = false,
    label,
    description,
    tickRotation,
    index
}: //i18nNamespace
{
    key: string
    hasLink: boolean
    label: string
    description: string
    tickRotation?: number
    index?: number
    i18nNamespace?: string
}) => {
    if (!label) {
        return null
    }
    const theme = useTheme()
    const shortenLabel = label.length > labelMaxLength
    const shortLabel = shortenLabel ? shorten(label) : label

    const textProps = {
        transform: `translate(-${getTextOffset()},0) rotate(0)`,
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
        <text data-i18n={key} {...textProps}>
            {shortLabel ?? label}
        </text>
    )

    const textContents = `#${index}: ${description ?? label}`

    return (
        <TooltipComponent
            trigger={component}
            contents={textContents}
            asChild={true}
            clickable={hasLink}
        />
    )
}

export const getBucketLabel = args => {
    let key, label
    const { getString } = useI18n()
    const {
        shouldTranslate,
        i18nNamespace,
        id,
        entity,
        shortenLabel = false,
        label: providedLabel
    } = args
    if (id === NO_ANSWER) {
        key = 'charts.no_answer'
        label = getString('charts.no_answer').t
    } else if (id === NO_MATCH) {
        key = 'charts.no_match'
        label = getString('charts.no_match').t
    } else {
        key = i18nNamespace === 'features' ? `features.${id}` : `options.${i18nNamespace}.${id}`
        const s = getString(key)

        if (providedLabel) {
            key = 'providedLabel'
            label = providedLabel
        } else if (entity?.name) {
            key = 'entity'
            label = entity.nameClean || entity.name
        } else if (shouldTranslate && !s.missing) {
            label = s.tClean || s.t
        } else {
            label = id
        }

        label = shortenLabel ? shorten(label) + '…' : label
    }
    return { key, label }
}

export const TickItem = (tick: TickItemProps) => {
    const { getString } = useI18n()

    const {
        x,
        y,
        value,
        shouldTranslate,
        i18nNamespace,
        entity,
        tickRotation,
        label,
        itemCount,
        tickIndex,
        role
    } = tick

    let link,
        description = tick.description

    const { key, label: tickLabel } = getItemLabel({
        i18nNamespace,
        entity,
        id: tick.value!,
        getString,
        label
    })

    if (entity) {
        const { homepage, github, mdn, resources } = entity
        link = homepage?.url || github?.url || mdn?.url || resources?.[0].url
    }
    if (shouldTranslate) {
        const descriptionString = getString(`options.${i18nNamespace}.${value}.description`)
        if (!descriptionString.missing) {
            description = descriptionString.t
        }
    }

    const index = itemCount - tickIndex

    const textProps = {
        id: tick.value,
        key,
        label: typeof tickLabel === 'undefined' ? '' : tickLabel + '',
        description: description || '',
        tickRotation,
        index
    }

    const showLinks = entity && getSocialLinks(entity).length > 0

    return (
        <g transform={`translate(${x},${y})`} role={role}>
            {link ? (
                <a href={link}>
                    <Text hasLink={true} {...textProps} />
                </a>
            ) : (
                <Text hasLink={false} {...textProps} />
            )}
            {/* {entity ? (
                <Popover trigger={<Text hasLink={false} {...textProps} />}>
                    <TickItemLinks entity={entity} />
                </Popover>
            ) : (
                <Text hasLink={false} {...textProps} />
            )} */}
            {/* {showLinks && (
                <g transform={`translate(-${getTextOffset() + 10},0)`}>
                    <TickItemLinks entity={entity} />
                </g>
            )} */}
        </g>
    )
}

const ShowMore_ = styled.g``

export default TickItem
