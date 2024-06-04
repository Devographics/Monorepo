import { useState } from 'react'
import { VerticalBarChartState, VerticalBarViews } from '../types'
import { BlockVariantDefinition } from 'core/types'
import { getViewDefinition } from './views'

export const getDefaultState = ({ block }: { block: BlockVariantDefinition }) => {
    const defaultState = {} as VerticalBarChartState
    if (block.defaultView) {
        defaultState.view = block.defaultView
    } else {
        defaultState.view = VerticalBarViews.AVERAGE
    }
    return defaultState
}

export const useChartState = (defaultState: {
    [P in keyof VerticalBarChartState]?: VerticalBarChartState[P]
}) => {
    const [view, setView] = useState<VerticalBarChartState['view']>(
        defaultState.view || VerticalBarViews.AVERAGE
    )
    const [highlighted, setHighlighted] = useState<string | null>(null)

    const viewDefinition = getViewDefinition(view)
    const chartState: VerticalBarChartState = {
        view,
        setView,
        highlighted,
        setHighlighted,
        viewDefinition
    }
    return chartState
}
