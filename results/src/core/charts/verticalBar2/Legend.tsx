import React from 'react'
import { OptionMetadata, OrderOptions } from '@devographics/types'
import { ColorScale, neutralColor } from '../common2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import T from 'core/i18n/T'
import { Toggle, ToggleItemType } from '../common2'
import { VerticalBarChartState } from './types'

type LegendProps = {
    chartState: VerticalBarChartState
    i18nNamespace: string
    options: OptionMetadata[]
    colorScale: ColorScale
    enableSort?: boolean
}

const DEFAULT_SORT = 'default'

export const useOptionsToggleItems = ({
    options,
    i18nNamespace,
    sort,
    order = OrderOptions.DESC,
    colorScale,
    enableSort = true
}: {
    options: OptionMetadata[]
    i18nNamespace?: string
    colorScale?: ColorScale
    sort?: string | undefined
    order?: OrderOptions
    enableSort?: boolean
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
            id,
            gradient: getGradient(option),
            isEnabled,
            className: `column-heading-sort column-heading-order-${order} ${
                isEnabled ? 'column-heading-sort-enabled' : ''
            }`,
            label: shortLabel,
            tooltip: enableSort ? (
                <T
                    k={isEnabled ? 'charts.sorted_by_sort_order' : 'charts.sort_by_sort'}
                    values={{ sort: columnLabel, order: orderLabel }}
                    md={true}
                />
            ) : (
                <span>{columnLabel}</span>
            )
        }
    })
}
export const Legend = ({
    chartState,
    i18nNamespace,
    options,
    colorScale,
    enableSort
}: LegendProps) => {
    const { getString } = useI18n()

    const { setHighlighted } = chartState

    // const handleSelect = (optionId: string) => {
    //     const isEnabled = sort === optionId
    //     if (optionId === DEFAULT_SORT) {
    //         setSort(undefined)
    //         setOrder(OrderOptions.ASC)
    //     } else if (!isEnabled) {
    //         setSort(optionId as string)
    //         setOrder(OrderOptions.ASC)
    //     } else if (sort && order === OrderOptions.ASC) {
    //         setOrder(OrderOptions.DESC)
    //     } else {
    //         setSort(undefined)
    //         setOrder(OrderOptions.ASC)
    //     }
    // }

    const items = useOptionsToggleItems({ options, colorScale, i18nNamespace, enableSort })

    return (
        <div className="chart-legend chart-legend-verticalBar">
            <Toggle
                alwaysExpand={true}
                // labelId="charts.sort_by"
                handleSelect={() => {
                    return
                }}
                handleHover={id => {
                    setHighlighted(id)
                }}
                items={items}
                hasDefault={true}
            />
        </div>
    )
}

export default Legend
