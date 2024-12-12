import React from 'react'
import { CardinalitiesChartState } from './types'
import { Toggle, ToggleItemType } from '../common2'
import { useI18n } from '@devographics/react-i18n'
import { FeaturesOptions, RatiosEnum } from '@devographics/types'
import T from 'core/i18n/T'

const ViewSwitcher = ({ chartState }: { chartState: CardinalitiesChartState }) => {
    const { view, setView } = chartState
    const { getString } = useI18n()
    const items: ToggleItemType[] = [FeaturesOptions.USED, FeaturesOptions.HEARD].map(id => {
        const labelKey = `options.features.${id}`
        const labelKeyShort = `${labelKey}.short`
        const item: ToggleItemType = {
            id,
            isEnabled: view === id,
            labelKey: labelKeyShort,
            label: getString(labelKeyShort)?.t
        }
        const description = getString(labelKey)
        if (description) {
            item.tooltip = <T k={labelKey} html={true} md={true} />
        }
        return item
    })
    return <Toggle<FeaturesOptions> labelId="charts.view" handleSelect={setView} items={items} />
}

export default ViewSwitcher
