import './Legend.scss'
import React from 'react'
import { Entity } from '@devographics/types'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { getItemLabel } from 'core/helpers/labels'
import { MultiRatiosChartState } from './types'

export type LegendItem = {
    id: string
    entity?: Entity
}

const Legend = ({
    items,
    chartState
}: {
    items: LegendItem[]
    chartState: MultiRatiosChartState
}) => {
    return (
        <div className="chart-legend-2">
            {items.map((item, i) => (
                <LegendItem key={item.id} item={item} lineIndex={i} chartState={chartState} />
            ))}
        </div>
    )
}

export const LegendItem = ({
    item,
    lineIndex,
    chartState
}: {
    item: LegendItem
    lineIndex: number
    chartState: MultiRatiosChartState
}) => {
    const { getString } = useI18n()
    const theme = useTheme()

    const { setHighlighted } = chartState
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
            <span className="legend-item-label">{shortLabel}</span>
        </div>
    )
}

export default Legend
