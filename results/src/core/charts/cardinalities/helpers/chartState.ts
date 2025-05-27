import { FeaturesOptions } from '@devographics/types'
import { useState } from 'react'
import { CardinalitiesChartState } from '../types'

export const useChartState = () => {
    const [view, setView] = useState<FeaturesOptions>(FeaturesOptions.USED)
    const [highlightedRow, setHighlightedRow] =
        useState<CardinalitiesChartState['highlightedRow']>(null)

    const chartState: CardinalitiesChartState = {
        view,
        setView,
        highlightedRow,
        setHighlightedRow
    }
    return chartState
}
