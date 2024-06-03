import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { MultiRatiosChartState, Ratios } from '../types'
import { formatPercentage } from 'core/charts/common2/helpers/labels'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    return { view: Ratios.USAGE } as MultiRatiosChartState
}

export const useChartState = (defaultState: MultiRatiosChartState) => {
    const [view, setView] = useState<Ratios>(defaultState.view)

    const chartState: MultiRatiosChartState = {
        view,
        setView,
        viewDefinition: {
            formatValue: formatPercentage,
            getEditionValue: (edition, chartState) =>
                Math.floor((edition?.ratios?.[chartState.view] || 0) * 100)
        }
    }
    return chartState
}
