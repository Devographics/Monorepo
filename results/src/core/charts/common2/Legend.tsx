import './Legend.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { getItemLabel } from 'core/helpers/labels'
import { ChartStateWithHighlighted, LegendItem } from './types'
import { getDistinctColor } from './helpers/colors'

export const Legend = <ChartStateType extends ChartStateWithHighlighted>({
    items,
    chartState,
    i18nNamespace
}: {
    items: LegendItem[]
    chartState: ChartStateType
    i18nNamespace?: string
}) => {
    const { highlighted, subset } = chartState
    const hasHighlight = highlighted !== null

    const itemsSubset = subset ? items.filter(item => subset.includes(item.id)) : items
    return (
        <div
            className={`chart-legend-2 chart-legend-${
                hasHighlight ? 'hasHighlight' : 'noHighlight'
            }`}
        >
            {itemsSubset.map((item, i) => (
                <Item<ChartStateType>
                    key={item.id}
                    item={item}
                    lineIndex={i}
                    chartState={chartState}
                    i18nNamespace={i18nNamespace}
                />
            ))}
        </div>
    )
}

const Item = <ChartStateType extends ChartStateWithHighlighted>({
    item,
    lineIndex,
    chartState,
    i18nNamespace
}: {
    item: LegendItem
    lineIndex: number
    chartState: ChartStateType
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()
    const theme = useTheme()

    const { id, entity, label: label_, color } = item

    const { highlighted, setHighlighted } = chartState
    const lineColor = color || getDistinctColor(theme.colors.distinct, lineIndex)

    const labelObject = getItemLabel({
        id,
        entity,
        getString,
        label: label_,
        i18nNamespace
    })
    const label = labelObject?.shortLabel

    const style = {
        '--color1': lineColor,
        '--color2': lineColor
    }

    const isHighlighted = highlighted === id
    return (
        <div
            style={style}
            className={`chart-legend-item chart-legend-item-${
                isHighlighted ? 'highlighted' : 'notHighlighted'
            }`}
            onMouseEnter={e => {
                setHighlighted(id)
            }}
            onMouseLeave={e => {
                setHighlighted(null)
            }}
        >
            <div className="legend-item-color" />
            <span className="legend-item-label" data-key={labelObject.key}>
                {label}
            </span>
        </div>
    )
}

export default Legend
