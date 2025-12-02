import React from 'react'
import { useI18n } from '@devographics/react-i18n'
import { ChartStateWithFilter } from '../common2/types'
import T from 'core/i18n/T'
import { Toggle, ToggleMode } from '../common2'
import { BlockVariantDefinition } from 'core/types'
import { BaselineStatuses } from '@devographics/types'

type MultiItemsCategoriesProps = {
    block: BlockVariantDefinition
    chartState: ChartStateWithFilter
}

const ALL_OPTIONS = 'all'

export const MultiItemsBaseline = ({ chartState }: MultiItemsCategoriesProps) => {
    const { getString } = useI18n()

    const { filter, setFilter } = chartState

    const handleSelect = (categoryId: string) => {
        if (categoryId === ALL_OPTIONS) {
            setFilter(undefined)
        } else {
            setFilter(categoryId)
        }
    }
    const allItem = {
        id: ALL_OPTIONS,
        isEnabled: filter === undefined,
        label: getString('charts.all_filters')?.t,
        tooltip: <T k="charts.all_filters.description" />
    }
    const items = Object.values(BaselineStatuses).map(statusId => {
        const isEnabled = statusId === filter
        const key = `baseline.support.${statusId}`
        const shortLabel = getString(key)?.t
        return {
            id: statusId,
            isEnabled,
            labelKey: key,
            label: shortLabel,
            tooltip: <T k={`baseline.support.${statusId}.description`} />
        }
    })
    return (
        <div className="multi-items-categories">
            <Toggle
                labelId="charts.filter_by.baseline"
                handleSelect={handleSelect}
                items={[allItem, ...items]}
                hasDefault={false}
                mode={ToggleMode.DROPDOWN}
            />
        </div>
    )
}

export default MultiItemsBaseline
