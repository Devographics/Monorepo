import React from 'react'
import { OptionMetadata } from '@devographics/types'
import { ColorScale, neutralColor } from '../common2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { HorizontalBarChartState } from './types'
import { OrderOptions } from '../common2/types'
import T from 'core/i18n/T'
import { Toggle } from '../common2'

type LegendProps = {
    chartState: HorizontalBarChartState
    i18nNamespace: string
    options: OptionMetadata[]
    colorScale: ColorScale
}

const DEFAULT_SORT = 'default'

export const Legend = ({ chartState, i18nNamespace, options, colorScale }: LegendProps) => {
    const { getString } = useI18n()

    const { sort, setSort, order, setOrder } = chartState

    const handleSelect = (optionId: string) => {
        const isEnabled = sort === optionId
        if (optionId === DEFAULT_SORT) {
            setSort(undefined)
            setOrder(OrderOptions.ASC)
        } else if (!isEnabled) {
            setSort(optionId as string)
            setOrder(OrderOptions.ASC)
        } else if (sort && order === OrderOptions.ASC) {
            setOrder(OrderOptions.DESC)
        } else {
            setSort(undefined)
            setOrder(OrderOptions.ASC)
        }
    }

    const getGradient = (option: OptionMetadata) =>
        colorScale?.[option.id] || [neutralColor, neutralColor]

    const items = options.map(option => {
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
    return (
        <div className="chart-legend">
            <Toggle labelId="charts.sort_by" handleSelect={handleSelect} items={items} />
        </div>
    )
}

export default Legend
