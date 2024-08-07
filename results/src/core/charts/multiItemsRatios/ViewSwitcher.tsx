import React from 'react'
import { MultiRatiosChartState, Ratios } from './types'
import { Toggle, ToggleItemType } from '../common2'
import { useI18n } from '@devographics/react-i18n'

const ViewSwitcher = ({ chartState }: { chartState: MultiRatiosChartState }) => {
    const { view, setView } = chartState
    const { getString } = useI18n()
    const items: ToggleItemType[] = Object.values(Ratios).map(id => {
        return {
            id,
            isEnabled: view === id,
            label: getString(`ratios.${id}`)?.t
        }
    })
    return <Toggle labelId="charts.view" handleSelect={setView} items={items} />
}

export default ViewSwitcher
