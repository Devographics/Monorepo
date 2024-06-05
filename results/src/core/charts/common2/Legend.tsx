import './Legend.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { getItemLabel } from 'core/helpers/labels'
import { LegendItem } from './types'

export const Legend = <ChartStateType,>({
    items,
    chartState
}: {
    items: LegendItem[]
    chartState: ChartStateType
}) => {
    return (
        <div className="chart-legend-2">
            {items.map((item, i) => (
                <Item<ChartStateType>
                    key={item.id}
                    item={item}
                    lineIndex={i}
                    chartState={chartState}
                />
            ))}
        </div>
    )
}

const Item = <ChartStateType,>({
    item,
    lineIndex,
    chartState
}: {
    item: LegendItem
    lineIndex: number
    chartState: ChartStateType
}) => {
    const { getString } = useI18n()
    const theme = useTheme()

    const { id, entity, label: label_, color } = item

    const { setHighlighted } = chartState
    const lineColor = color || theme.colors.distinct[lineIndex]

    const label =
        label_ ||
        getItemLabel({
            id,
            entity,
            getString
            // i18nNamespace
        })?.shortLabel

    const style = {
        '--color1': lineColor,
        '--color2': lineColor
    }
    return (
        <div
            style={style}
            className="chart-legend-item"
            onMouseEnter={e => {
                setHighlighted(id)
            }}
            onMouseLeave={e => {
                setHighlighted(null)
            }}
        >
            <div className="legend-item-color" />
            <span className="legend-item-label">{label}</span>
        </div>
    )
}

export default Legend
