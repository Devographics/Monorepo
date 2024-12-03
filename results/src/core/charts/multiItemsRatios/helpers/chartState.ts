import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { Modes, MultiRatiosChartState, Ratios } from '../types'
import { formatPercentage } from 'core/charts/common2/helpers/format'
import { multiRatiosViewDefinition } from './view'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    return { view: Ratios.USAGE, mode: Modes.VALUE } as MultiRatiosChartState
}

export const useChartState = (defaultState: MultiRatiosChartState) => {
    const [view, setView] = useState<Ratios>(defaultState.view)
    const [mode, setMode] = useState<Modes>(defaultState.mode)
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const chartState: MultiRatiosChartState = {
        view,
        setView,
        mode,
        setMode,
        highlighted,
        setHighlighted,
        viewDefinition: multiRatiosViewDefinition
    }
    return chartState
}
