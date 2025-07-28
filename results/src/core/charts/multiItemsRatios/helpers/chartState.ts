import { useState } from 'react'
import { BlockVariantDefinition } from 'core/types'
import { ModesEnum, MultiRatiosChartState, MultiRatioSerie } from '../types'
import { QuestionMetadata, RatiosEnum } from '@devographics/types'
import { viewDefinition } from './viewDefinition'
import { getTopItems } from '../SubsetControls'

export const getDefaultState = ({
    block,
    series,
    question
}: {
    block: BlockVariantDefinition
    series: MultiRatioSerie[]
    question: QuestionMetadata
}) => {
    const chartState = { view: RatiosEnum.USAGE, mode: ModesEnum.VALUE } as MultiRatiosChartState
    const { variables } = block
    const enableMultiSection = variables?.enableMultiSection

    const { getLineItems } = viewDefinition
    const items = getLineItems({ serie: series[0], question, chartState })

    // if multiSection mode is enabled, we don't show all items
    // instead we show the top 10 items by default
    chartState.subset = enableMultiSection ? getTopItems(items).map(item => item.id) : null

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
