import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { ModesEnum, MultiRatiosChartState } from '../types'
import { RatiosEnum } from '@devographics/types'
import { SubsetPresets } from './subsets'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    const { variables } = block
    const enableMultiSection = variables?.enableMultiSection

    const chartState = {
        view: RatiosEnum.USAGE,
        mode: ModesEnum.VALUE,
        subset: enableMultiSection ? SubsetPresets.TOP_ITEMS : null
    } as MultiRatiosChartState

    return chartState
}

export const useChartState = (defaultState: MultiRatiosChartState) => {
    const [view, setView] = useState<RatiosEnum>(defaultState.view)
    const [mode, setMode] = useState<ModesEnum>(defaultState.mode)
    const [highlighted, setHighlighted] = useState<MultiRatiosChartState['highlighted']>(null)
    const [subset, setSubset] = useState<MultiRatiosChartState['subset']>(defaultState.subset)

    const chartState: MultiRatiosChartState = {
        view,
        setView,
        mode,
        setMode,
        highlighted,
        setHighlighted,
        subset,
        setSubset
    }
    return chartState
}
