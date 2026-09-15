import './Legend.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { getItemLabel } from 'core/helpers/labels'
import { ChartStateWithHighlighted, LegendItemType } from './types'
import { getDistinctColor } from './helpers/colors'
import T from 'core/i18n/T'

export const Legend = <ChartStateType extends ChartStateWithHighlighted>({
    items,
    chartState,
    i18nNamespace
}: {
    items: LegendItemType[]
    chartState: ChartStateType
    i18nNamespace?: string
}) => {
    const { highlighted } = chartState
    const hasHighlight = highlighted !== null

    const hasGroups = items.some(item => item.group)

    // keep a stable, first-seen order for the groups, but always put the
    // ungrouped ('') group last
    const groups = hasGroups
        ? items
              .reduce<string[]>((acc, item) => {
                  const group = item.group ?? ''
                  return acc.includes(group) ? acc : [...acc, group]
              }, [])
              .sort((a, b) => Number(a === '') - Number(b === ''))
        : []

    return (
        <div
            className={`chart-legend-2 chart-legend-${
                hasHighlight ? 'hasHighlight' : 'noHighlight'
            }`}
        >
            {hasGroups
                ? groups.map((groupId, groupIndex) => {
                      const groupKey = groupId || 'other'
                      return (
                          <div key={groupKey} className="chart-legend-group">
                              <h4 className="chart-legend-group-label">
                                  <T k={`options.${i18nNamespace}.${groupKey}`} />
                              </h4>

                              <div className="chart-legend-group-items">
                                  {items
                                      .map((item, i) => ({ item, lineIndex: i }))
                                      .filter(({ item }) => (item.group ?? '') === groupId)
                                      .map(({ item, lineIndex }) => (
                                          <LegendItem<ChartStateType>
                                              key={item.id}
                                              item={item}
                                              lineIndex={lineIndex}
                                              chartState={chartState}
                                              i18nNamespace={i18nNamespace}
                                          />
                                      ))}
                              </div>
                          </div>
                      )
                  })
                : items.map((item, i) => (
                      <LegendItem<ChartStateType>
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

const LegendItem = <ChartStateType extends ChartStateWithHighlighted>({
    item,
    lineIndex,
    chartState,
    i18nNamespace
}: {
    item: LegendItemType
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
