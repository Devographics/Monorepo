import React from 'react'
import { MultiRatiosChartState } from './types'
import { Toggle, ToggleItemType } from '../common2'
import { useI18n } from '@devographics/react-i18n'
import { RatiosEnum } from '@devographics/types'
import T from 'core/i18n/T'
import {
    SatisfactionIcon,
    AppreciationIcon,
    AwarenessIcon,
    InterestIcon,
    PositivityIcon,
    UsageIcon
} from '@devographics/icons'

export const ratioViewsIcons = {
    [RatiosEnum.USAGE]: UsageIcon,
    [RatiosEnum.AWARENESS]: AwarenessIcon,
    [RatiosEnum.INTEREST]: InterestIcon,
    [RatiosEnum.RETENTION]: SatisfactionIcon,
    [RatiosEnum.POSITIVITY]: PositivityIcon,
    [RatiosEnum.APPRECIATION]: AppreciationIcon,
    [RatiosEnum.RELATIVE_POSITIVITY]: PositivityIcon
}

const ViewSwitcher = ({ chartState }: { chartState: MultiRatiosChartState }) => {
    const { view, setView } = chartState
    const { getString } = useI18n()
    const items: ToggleItemType[] = Object.values(RatiosEnum)
        .filter(r => r !== RatiosEnum.POSITIVITY)
        .map(id => {
            const labelKey = `ratios.${id}`
            const descriptionKey = `${labelKey}.description`
            const item: ToggleItemType = {
                id,
                isEnabled: view === id,
                labelKey,
                label: getString(labelKey)?.t,
                icon: ratioViewsIcons[id]
            }
            const description = getString(descriptionKey)
            if (description) {
                item.tooltip = <T k={descriptionKey} html={true} md={true} />
            }
            return item
        })
    return <Toggle labelId="charts.view" handleSelect={setView} items={items} />
}

export default ViewSwitcher
