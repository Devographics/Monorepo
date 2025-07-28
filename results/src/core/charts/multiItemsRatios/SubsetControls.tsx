import './SubsetControls.scss'
import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { useTheme } from 'styled-components'
import { getItemLabel } from 'core/helpers/labels'
import { EditionWithRankAndPointData, MultiRatiosChartState, MultiRatioSerie } from './types'
import { LegendItem } from '../common2/types'
import { getDistinctColor } from '../common2/helpers/colors'
import { BlockComponentProps, PageContextValue } from 'core/types'
import Button from 'core/components/Button'
import { viewDefinition } from './helpers/viewDefinition'
import { LineItem } from '../verticalBar2/types'
import sortBy from 'lodash/sortBy'
import ButtonGroup from 'core/components/ButtonGroup'

const ITEMS_TO_KEEP = 12
const getItemsSortedByValue = (items: LineItem<EditionWithRankAndPointData>[]) => {
    return sortBy(items, item => item?.points?.at(-1)?.value)
}
export const getTopItems = (items: LineItem<EditionWithRankAndPointData>[]) => {
    return getItemsSortedByValue(items).toReversed().slice(0, ITEMS_TO_KEEP)
}
const getBottomItems = (items: LineItem<EditionWithRankAndPointData>[]) => {
    return getItemsSortedByValue(items).slice(0, ITEMS_TO_KEEP)
}

const getItemsSortedByDelta = (items: LineItem<EditionWithRankAndPointData>[]) => {
    const itemsWithAtLeastTwoPoints = items.filter(item => item.points.length > 1)
    return sortBy(
        itemsWithAtLeastTwoPoints,
        item => (item?.points?.at(-1)?.value || 0) - (item?.points?.at(0)?.value || 0)
    )
}
const getLargestIncrease = (items: LineItem<EditionWithRankAndPointData>[]) => {
    return getItemsSortedByDelta(items).toReversed().slice(0, ITEMS_TO_KEEP)
}
const getLargestDecrease = (items: LineItem<EditionWithRankAndPointData>[]) => {
    return getItemsSortedByDelta(items).slice(0, ITEMS_TO_KEEP)
}

const presets = [
    { id: 'top_items', func: getTopItems },
    { id: 'bottom_items', func: getBottomItems },
    { id: 'largest_increase', func: getLargestIncrease },
    { id: 'largest_decrease', func: getLargestDecrease }
]

export const SubsetControls = ({
    chartState,
    i18nNamespace,
    pageContext,
    series,
    question
}: {
    chartState: MultiRatiosChartState
    i18nNamespace?: string
    pageContext: PageContextValue
    series: MultiRatioSerie[]
    question: BlockComponentProps['question']
}) => {
    const { highlighted, setSubset } = chartState

    const sections = pageContext.currentEdition.sections

    // assume we're only dealing with a single serie for now
    const serie = series[0]
    const { getLineItems } = viewDefinition
    const items = getLineItems({ serie, question, chartState })
    const itemsWithIndex = items.map((item, itemIndex) => ({ ...item, itemIndex }))

    const itemsBySections = sections
        .map(section => ({
            id: section.id,
            items: itemsWithIndex.filter(item => section.questions.map(q => q.id).includes(item.id))
        }))
        .filter(section => section.items.length > 0)

    const hasHighlight = highlighted !== null

    return (
        <div
            className={`chart-legend-multiSection chart-legend-${
                hasHighlight ? 'hasHighlight' : 'noHighlight'
            }`}
        >
            <div className="subset-controls-group">
                <h4>Presets</h4>

                <ButtonGroup>
                    {presets.map(({ id, func }) => (
                        <Button
                            key={id}
                            size="small"
                            onClick={e => {
                                const ids = func(items).map(item => item.id)
                                setSubset(ids)
                            }}
                        >
                            {id}
                        </Button>
                    ))}
                </ButtonGroup>
            </div>
            <div className="subset-controls-group">
                <h4>By Section</h4>

                <ButtonGroup>
                    {itemsBySections.map((section, i) => (
                        <Section
                            key={section.id}
                            section={section}
                            sectionIndex={i}
                            chartState={chartState}
                            i18nNamespace={i18nNamespace}
                        />
                    ))}
                </ButtonGroup>
            </div>
        </div>
    )
}

const Section = ({
    section,
    sectionIndex,
    chartState,
    i18nNamespace
}: {
    section: { id: string; items: LegendItem[] }
    sectionIndex: number
    chartState: MultiRatiosChartState
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()
    const { id, items } = section
    const { setSubset } = chartState
    const { label, key } = getItemLabel({
        id,
        getString,
        i18nNamespace
    })

    return (
        <div className="chart-legend-multiSection-section">
            {/* <h4 data-key={key} className="chart-legend-multiSection-heading">
                <label>
                    <input type="checkbox" /> {label}
                </label>
            </h4> */}
            <Button
                size="small"
                onClick={e => {
                    setSubset(items.map(item => item.id))
                }}
            >
                {label}
            </Button>
            {/* <div className="chart-legend-multiSection-items">
                {items.map((item, i) => (
                    <Item
                        key={item.id}
                        item={item}
                        lineIndex={i}
                        chartState={chartState}
                        i18nNamespace={i18nNamespace}
                    />
                ))}
            </div> */}
        </div>
    )
}

const Item = ({
    item,
    chartState,
    i18nNamespace
}: {
    item: LegendItem
    chartState: MultiRatiosChartState
    i18nNamespace?: string
}) => {
    const { getString } = useI18n()
    const theme = useTheme()

    const { id, entity, label: label_, color, itemIndex } = item

    const { highlighted, setHighlighted } = chartState
    const lineColor = color || getDistinctColor(theme.colors.distinct, itemIndex)

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

export default SubsetControls
