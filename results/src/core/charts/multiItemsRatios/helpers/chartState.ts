import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { ModesEnum, MultiRatiosChartState, Ratios } from '../types'
import { RatiosEnum } from '@devographics/types'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    return { view: RatiosEnum.USAGE, mode: ModesEnum.VALUE } as MultiRatiosChartState
}

export const useChartState = (defaultState: MultiRatiosChartState) => {
    const [view, setView] = useState<RatiosEnum>(defaultState.view)
    const [mode, setMode] = useState<ModesEnum>(defaultState.mode)
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const chartState: MultiRatiosChartState = {
        view,
        setView,
        mode,
        setMode,
        highlighted,
        setHighlighted
    }
    return chartState
}
