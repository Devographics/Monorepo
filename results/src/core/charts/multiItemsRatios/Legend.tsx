import './Legend.scss'
import React from 'react'
import { Entity } from '@devographics/types'
import Tooltip from 'core/components/Tooltip'
import Button from 'core/components/Button'
import T from 'core/i18n/T'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { getItemLabel } from 'core/helpers/labels'

type LegendItem = {
    id: string
    entity?: Entity
}

const Legend = ({ items, onMouseEnter, onMouseLeave }: { items: LegendItem[] }) => {
    return (
        <div className="chart-legend-2">
            {items.map((item, i) => (
                <LegendItem key={item.id} item={item} lineIndex={i} />
            ))}
        </div>
    )
}

export const LegendItem = ({ item, lineIndex }: { item: LegendItem; lineIndex: number }) => {
    const { getString } = useI18n()
    const theme = useTheme()

    const lineColor = theme.colors.distinct[lineIndex]

    const { id, entity } = item
    const { label, shortLabel, key } = getItemLabel({
        id,
        entity,
        getString
        // i18nNamespace
    })

    const style = {
        '--color1': lineColor,
        '--color2': lineColor
    }
    return (
        <div style={style} className="chart-legend-item">
            <div className="legend-item-color" />
            <span className="legend-item-label">{shortLabel}</span>
        </div>
    )
}

export default Legend
