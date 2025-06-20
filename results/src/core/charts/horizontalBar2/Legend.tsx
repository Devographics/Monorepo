import React from 'react'
import { OptionMetadata } from '@devographics/types'
import { ColorScale, neutralColor } from '../common2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { HorizontalBarChartState } from './types'
import { OrderOptions } from '../common2/types'
import T from 'core/i18n/T'
import { Toggle, ToggleItemType, ToggleValueType } from '../common2'

type LegendProps = {
    chartState: HorizontalBarChartState
    i18nNamespace: string
    options: OptionMetadata[]
    colorScale: ColorScale
}

const DEFAULT_SORT = 'default'

export const useOptionsToggleItems = ({
    options,
    i18nNamespace,
    sort,
    order = OrderOptions.DESC,
    colorScale
}: {
    options: OptionMetadata[]
    i18nNamespace?: string
    colorScale?: ColorScale
    sort?: string | undefined
    order?: OrderOptions
}): ToggleItemType[] => {
    const { getString } = useI18n()

    const getGradient = (option: OptionMetadata) =>
        colorScale?.[option.id] || [neutralColor, neutralColor]

    return options.map(option => {
        const { id, entity } = option
        const isEnabled = sort === id
        const { label, shortLabel, key } = getItemLabel({
            id,
            entity,
            getString,
            i18nNamespace
        })
        const columnLabel = shortLabel
        const orderLabel = getString(`charts.order.${order}`)?.t
        return {
            labelKey: key,
            id,
            gradient: getGradient(option),
            isEnabled,
            className: `column-heading-sort column-heading-order-${order} ${
                isEnabled ? 'column-heading-sort-enabled' : ''
            }`,
            label: shortLabel,
            tooltip: (
                <T
                    k={isEnabled ? 'charts.sorted_by_sort_order' : 'charts.sort_by_sort'}
                    values={{ sort: columnLabel, order: orderLabel }}
                    md={true}
                />
            )
        }
    })
}
export const Legend = ({ chartState, i18nNamespace, options, colorScale }: LegendProps) => {
    const { getString } = useI18n()

    const { sort, setSort, order, setOrder, setHighlightedCell } = chartState

    const handleSelect = (optionId: ToggleValueType | null) => {
        const isEnabled = sort === optionId
        if (optionId === DEFAULT_SORT) {
            // we're explicitely clearing the sort (used with select menus)
            setSort(undefined)
            setOrder(OrderOptions.DESC)
        } else if (!isEnabled) {
            // if no sort is enabled when we click, we switch to DESC
            setSort(optionId as string)
            setOrder(OrderOptions.DESC)
        } else if (sort && order === OrderOptions.DESC) {
            // if we're sorting by DESC order when we click, we switch to ASC
            setOrder(OrderOptions.ASC)
        } else {
            // any other scenario (e.g. we're sorting by ASC order when we click)
            // we clear the sort
            setSort(undefined)
            setOrder(OrderOptions.DESC)
        }
    }

    const items = useOptionsToggleItems({ options, colorScale, sort, order, i18nNamespace })

    return (
        <div className="chart-legend chart-legend-horizontalBar">
            <Toggle
                sortId={sort}
                sortOrder={order}
                labelId="charts.sort_by"
                handleSelect={handleSelect}
                items={items}
                hasDefault={true}
                handleHover={id => {
                    setHighlightedCell(id)
                }}
            />
        </div>
    )
}

export default Legend
