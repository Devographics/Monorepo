import React from 'react'
import { OptionMetadata } from '@devographics/types'
import { ColorScale } from '../common2/helpers/colors'
import { getItemLabel } from 'core/helpers/labels'
import { useI18n } from '@devographics/react-i18n'
import { ChartStateWithFilter } from '../common2/types'
import T from 'core/i18n/T'
import { Toggle } from '../common2'
import { BlockVariantDefinition } from 'core/types'

type MultiItemsCategoriesProps = {
    block: BlockVariantDefinition
    chartState: ChartStateWithFilter
}

const ALL_CATEGORIES = 'all'

export const MultiItemsCategories = ({ block, chartState }: MultiItemsCategoriesProps) => {
    const { getString } = useI18n()

    const { chartOptions, i18nNamespace } = block
    const categories = chartOptions?.categories || []

    const { filter, setFilter } = chartState

    const handleSelect = (categoryId: string) => {
        if (categoryId === ALL_CATEGORIES) {
            setFilter(undefined)
        } else {
            setFilter(categoryId)
        }
    }
    const allItem = {
        id: ALL_CATEGORIES,
        isEnabled: filter === undefined,
        label: getString('charts.all_filters')?.t,
        tooltip: <T k="charts.all_filters.description" />
    }
    const items = categories.map(categoryId => {
        const isEnabled = categoryId === filter
        const { label, shortLabel, key } = getItemLabel({
            id: categoryId,
            getString,
            i18nNamespace
        })
        const columnLabel = shortLabel
        return {
            id: categoryId,
            // gradient: getGradient(option),
            isEnabled,
            // className: `column-heading-sort column-heading-order-${order} ${
            //     isEnabled ? 'column-heading-sort-enabled' : ''
            // }`,
            label: shortLabel,
            tooltip: (
                <T
                    k={isEnabled ? 'charts.sorted_by_sort_order' : 'charts.sort_by_sort'}
                    md={true}
                />
            )
        }
    })
    return (
        <Toggle
            labelId="charts.filter_by"
            handleSelect={handleSelect}
            items={[allItem, ...items]}
            hasDefault={true}
        />
    )
}

export default MultiItemsCategories